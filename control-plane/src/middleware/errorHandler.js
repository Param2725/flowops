import { AppError, BadRequestError } from '@flowops/common';

const toAppError = (err) => {
    if (err instanceof AppError) return err;
    if (err.type === 'entity.parse.failed') {
        return new BadRequestError('Request body is not valid JSON');
    }
    if (err.type === 'entity.too.large') {
        return new AppError('Request body is too large', { statusCode: 413, code: 'PAYLOAD_TOO_LARGE' });
    }
    return new AppError('Internal server error', { statusCode: 500, code: 'INTERNAL_ERROR' });
};

export const errorHandler = (logger) => (err, req, res, next) => {
    if (res.headersSent) return next(err);

    const log = req.log ?? logger;
    const appError = toAppError(err);

    if (appError.statusCode >= 500) {
        log.error('request failed', { err });
    } else {
        log.warn('request rejected', { code: appError.code });
    }

    return res.status(appError.statusCode).json(appError.toResponse());
};