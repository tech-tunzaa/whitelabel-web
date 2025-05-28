/**
 * API Client - Re-exports from our centralized core module
 * 
 * This file provides backward compatibility for code that imports from
 * the old structure. It re-exports everything from the new core module.
 */

// Re-export API client for backward compatibility
import api from '../core/api';

// For backward compatibility with existing code
export const apiClient = api;
export default api;

// Re-export the token management functions
export const TokenManager = {
  getAccessToken: api.auth.getToken,
  getRefreshToken: api.auth.getRefreshToken,
  setTokens: api.auth.setTokens,
  clearTokens: api.auth.clearTokens
};

// Re-export the API error store
export { useApiErrorStore } from '../core/api';

// Re-export types
export type { ApiResponse, ApiError } from '../core/api';

// For auth-related imports
export const authApi = {
  login: api.auth.login,
  refreshToken: api.auth.refreshToken,
  logout: api.auth.logout
};
