const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const defaultWrite = (line) => process.stdout.write(`${line}\n`);

const normalizeFields = (fields) => {
  if (fields.err instanceof Error) {
    const { name, message, stack } = fields.err;
    return { ...fields, err: { name, message, stack } };
  }
  return fields;
};

export const createLogger = ({
  service = 'app',
  level = 'info',
  context = {},
  write = defaultWrite,
} = {}) => {
  const threshold = LEVELS[level] ?? LEVELS.info;

  const log = (lvl, message, fields = {}) => {
    if (LEVELS[lvl] < threshold) return;
    write(
      JSON.stringify({
        time: new Date().toISOString(),
        level: lvl,
        service,
        message,
        ...context,
        ...normalizeFields(fields),
      }),
    );
  };

  return {
    debug: (message, fields) => log('debug', message, fields),
    info: (message, fields) => log('info', message, fields),
    warn: (message, fields) => log('warn', message, fields),
    error: (message, fields) => log('error', message, fields),
    child: (extra) => createLogger({ service, level, context: { ...context, ...extra }, write }),
  };
};
