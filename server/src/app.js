import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '50kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
