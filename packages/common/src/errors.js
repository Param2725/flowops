export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL_ERROR', details } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }

  toResponse() {
    const body = { code: this.code, message: this.message };
    if (this.details !== undefined) body.details = this.details;
    return { error: body };
  }
}

const createErrorClass = (name, statusCode, code, defaultMessage) =>
  class extends AppError {
    constructor(message = defaultMessage, details) {
      super(message, { statusCode, code, details });
      this.name = name;
    }
  };

export const BadRequestError = createErrorClass(
  'BadRequestError',
  400,
  'BAD_REQUEST',
  'Bad request',
);
export const UnauthorizedError = createErrorClass(
  'UnauthorizedError',
  401,
  'UNAUTHORIZED',
  'Authentication required',
);
export const ForbiddenError = createErrorClass('ForbiddenError', 403, 'FORBIDDEN', 'Access denied');
export const NotFoundError = createErrorClass(
  'NotFoundError',
  404,
  'NOT_FOUND',
  'Resource not found',
);
export const ConflictError = createErrorClass(
  'ConflictError',
  409,
  'CONFLICT',
  'Resource conflict',
);
export const TooManyRequestsError = createErrorClass(
  'TooManyRequestsError',
  429,
  'RATE_LIMITED',
  'Too many requests',
);
export const BadGatewayError = createErrorClass(
  'BadGatewayError',
  502,
  'BAD_GATEWAY',
  'Upstream error',
);
export const ServiceUnavailableError = createErrorClass(
  'ServiceUnavailableError',
  503,
  'SERVICE_UNAVAILABLE',
  'Service unavailable',
);
export const GatewayTimeoutError = createErrorClass(
  'GatewayTimeoutError',
  504,
  'GATEWAY_TIMEOUT',
  'Upstream timed out',
);
