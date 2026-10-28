export const APP_NAME = 'FlowOps';

export const CORRELATION_HEADER = 'x-correlation-id';

export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});

export const CIRCUIT_STATES = Object.freeze({
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half-open',
});

export const BALANCER_STRATEGIES = Object.freeze({
  ROUND_ROBIN: 'round-robin',
  LEAST_CONNECTIONS: 'least-connections',
});
