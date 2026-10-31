import { CORRELATION_HEADER, resolveCorrelationId } from '@flowops/common';

export const correlationId = (req, res, next) => {
    req.correlationId = resolveCorrelationId(req.get(CORRELATION_HEADER));
    res.set(CORRELATION_HEADER, req.correlationId);
    next();
};