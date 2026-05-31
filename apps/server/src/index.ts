import express from 'express';
import dotEnv from 'dotenv';
dotEnv.config();

import { defaultJsonContentType } from './middlewares/defaultJsonContentType.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { requestContext } from './middlewares/requestContext.middleware';
import appRoute from './module/app/app.route';
import { logger, httpLogger } from './middlewares/httplogger.middleware';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { rabbitMQService } from './libs/rabbitmq';
import { renderLiteWorkerRegistry } from './workers/workers.module';
import { socketService } from './module/socket';
import path from 'path';
import { captureException, flushSentry, initSentry } from './libs/sentry';
import { staticHostMiddleware } from './module/static-host/static-host.middleware';

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  await initSentry();

  const app = express();
  app.use(requestContext);
  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
    }),
  );
  app.use(httpLogger);
  app.use(staticHostMiddleware());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(defaultJsonContentType);
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.json({
      limit: '10mb',
      // Capture the raw body for routes that need byte-exact verification
      // (e.g. GitHub webhook HMAC signatures).
      verify: (req, _res, buf) => {
        if (req.url?.includes('/github/webhook')) {
          (req as express.Request).rawBody = buf;
        }
      },
    }),
  );
  app.use('/api/v1', appRoute);
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server listening');
    rabbitMQService
      .connect()
      .then(async () => {
        await renderLiteWorkerRegistry.startAll();
      })
      .catch((error) => {
        logger.warn(
          { err: error },
          'RabbitMQ unavailable at startup. Workers will remain paused.',
        );
      });

    socketService.init(server).catch((err) => {
      logger.error({ err }, 'Failed to initialize Socket.IO');
    });
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
    captureException(reason);
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    captureException(err);
  });

  async function shutdown(signal: string) {
    logger.info({ signal }, 'Shutting down server');
    await socketService.close();
    await rabbitMQService.close();
    await flushSentry();
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to bootstrap server');
  process.exit(1);
});
