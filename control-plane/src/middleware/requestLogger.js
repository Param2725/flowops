const levelFor = (status) => {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
};

export const requestLogger = (logger) => (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  req.log = logger.child({ correlationId: req.correlationId });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    req.log[levelFor(res.statusCode)]('request completed', {
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
    });
  });

  next();
};
