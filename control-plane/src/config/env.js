const DEFAULT_PORT = 4000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

const parsePort = (value) => {
  const port = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }
  return port;
};

export const loadEnv = (source = process.env) => {
  if (!source.MONGO_URI) throw new Error('MONGO_URI is required');

  return Object.freeze({
    nodeEnv: source.NODE_ENV ?? 'development',
    port: parsePort(source.PORT),
    mongoUri: source.MONGO_URI,
    corsOrigins: (source.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    logLevel: source.LOG_LEVEL ?? 'info',
  });
};
