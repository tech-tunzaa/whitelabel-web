/**
 * Core Module - Simple exports of our core functionality
 */

// Export API module
export { default as api } from './api';
export { useApiErrorStore } from './api';

// Export Auth module
export { default as auth } from './auth';
export {
  useAuthStore,
  mapApiRole,
  extractUserRole,
  authenticateUser,
  refreshAuthToken,
  logoutUser
} from './auth';

// Export types with proper syntax for isolatedModules
import type { ApiResponse, ApiError } from './api';
import type { AuthUser, CustomUser, AuthState } from './auth';

export type { ApiResponse, ApiError, AuthUser, CustomUser, AuthState };
