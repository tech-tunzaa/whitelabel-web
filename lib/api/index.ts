/**
 * API Module - Re-exports from our centralized core module
 * 
 * This file provides backward compatibility for code that imports from
 * the old structure.
 */

// Re-export everything from the core API module
import api from '../core/api';
export default api;
export { useApiErrorStore } from '../core/api';

// Re-export types with proper syntax for isolatedModules
import type { ApiResponse, ApiError } from '../core/api';
export type { ApiResponse, ApiError };

// Re-export the apiClient for backward compatibility
export { apiClient } from './client';
