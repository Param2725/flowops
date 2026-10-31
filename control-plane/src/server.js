import 'dotenv/config';
import { createLogger } from '@flowops/common';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

const env = loadEnv();
const logger = createLogger({ service: 'control-plane', level: env.logLevel });

const start = async () => {
  await connectDb(env.mongoUri, logger);

  const app = createApp({ env, logger });
  const server = app.listen(env.port, () => {
    logger.info('control-plane listening', { port: env.port, nodeEnv: env.nodeEnv });
  });

  const shutdown = (signal) => {
    logger.info('shutting down', { signal });
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error('failed to start', { err });
  process.exit(1);
});
