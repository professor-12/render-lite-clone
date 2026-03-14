import express from 'express';
import dotEnv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware';
import appRoute from './module/app/app.route';
import { logger } from './middlewares/httplogger.middleware';
import cookieParser from 'cookie-parser';
import cors from 'cors';
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
// app.use()
app.use('/api/v1', appRoute);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Service is running at port ' + PORT + '!!!!');
});
