import { createApiClient } from './apiClient.js';
import { config } from './config.js';
import { session } from './session.js';

export const controlApi = createApiClient({
  baseUrl: config.controlPlaneUrl,
  getAccessToken: session.getAccessToken,
  onUnauthorized: session.refresh,
});
