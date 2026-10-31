import { NotFoundError } from '@flowops/common';

export const notFound = (req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
};