const trimSlash = (value) => value.replace(/\/+$/, '');

export const config = {
  controlPlaneUrl: trimSlash(import.meta.env.VITE_CONTROL_PLANE_URL ?? 'http://localhost:4000'),
  gatewayUrl: trimSlash(import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080'),
};
