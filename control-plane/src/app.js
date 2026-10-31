import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CORRELATION_HEADER } from '@flowops/common';
import { correlationId } from './middleware/correlationId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

export const createApp = ({ env, logger }) => {
  const app = express();

  app.use(correlationId);
  app.use(requestLogger(logger));
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, exposedHeaders: [CORRELATION_HEADER] }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.static(publicDir));

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler(logger));

  return app;
};
