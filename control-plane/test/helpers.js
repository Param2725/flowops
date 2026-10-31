import { createLogger } from '@flowops/common';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';

export const startTestServer = async () => {
  const logs = [];
  const logger = createLogger({
    service: 'test',
    level: 'debug',
    write: (line) => logs.push(JSON.parse(line)),
  });
  const env = loadEnv({ MONGO_URI: 'mongodb://localhost:27017/test' });
  const app = createApp({ env, logger });

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    logs,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};
