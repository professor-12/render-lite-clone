import express from 'express';
import { config } from 'dotenv';
import { errorHandler } from './middlewares/error.middleware.js';
import appRoute from './module/app/app.route.js';
import { logger } from './middlewares/httplogger.middleware.js';
config();
const PORT = process.env.PORT || 8080;

const app = express();

app.use('/api/v1', appRoute);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Service is running at port ' + PORT + '!!!!');
});
