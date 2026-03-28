import express from 'express';
import dotEnv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware';
import appRoute from './module/app/app.route';
import { logger, httpLogger } from './middlewares/httplogger.middleware';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { rabbitMQService } from './libs/rabbitmq';
import { renderLiteWorkerRegistry } from './workers/workers.module';
dotEnv.config();
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174',"http://localhost:3000","http://localhost:3001"],
    credentials:true
  }),
);
app.use(httpLogger);
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
      logger.warn({ err: error }, 'RabbitMQ unavailable at startup. Workers will remain paused.');
    });
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down server');
  await rabbitMQService.close();
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
