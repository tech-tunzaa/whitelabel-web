/**
 * Centralized API Client & Token Management
 *
 * This module provides a simple, centralized API client with token management
 * and automatic token refresh.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';

// API Response type for consistent typing
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// API Error format
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// Token Management - Handles both localStorage and session storage methods
const getToken = () => {
  // First check localStorage
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;
    
    // If not in localStorage, try to get from Next.js session
    // Note: This won't directly access HTTP-only cookies, but the session
    // data might be available in the window.__NEXT_DATA__ object
    try {
      // @ts-ignore - This is a Next.js specific property
      const nextData = window.__NEXT_DATA__;
      if (nextData?.props?.pageProps?.session?.accessToken) {
        // We found a token in the session, let's also save it to localStorage for future use
        const sessionToken = nextData.props.pageProps.session.accessToken;
        localStorage.setItem('token', sessionToken);
        return sessionToken;
      }
    } catch (e) {
      console.error('Error accessing session data:', e);
    }
  }
  return null;
};

const getRefreshToken = () => {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const localRefreshToken = localStorage.getItem('refresh_token');
    if (localRefreshToken) return localRefreshToken;
    
    // Try to get from Next.js session
    try {
      // @ts-ignore - This is a Next.js specific property
      const nextData = window.__NEXT_DATA__;
      if (nextData?.props?.pageProps?.session?.user?.token) {
        // Save to localStorage for future use
        const sessionRefreshToken = nextData.props.pageProps.session.user.token;
        localStorage.setItem('refresh_token', sessionRefreshToken);
        return sessionRefreshToken;
      }
    } catch (e) {
      console.error('Error accessing session refresh token:', e);
    }
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
};

// Function to synchronize tokens from NextAuth session to localStorage
// Call this from components after login
const syncTokensFromSession = () => {
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore - This is a Next.js specific property
      const nextData = window.__NEXT_DATA__;
      const session = nextData?.props?.pageProps?.session;
      
      if (session?.accessToken) {
        localStorage.setItem('token', session.accessToken);
      }
      
      if (session?.user?.token) {
        localStorage.setItem('refresh_token', session.user.token);
      }
    } catch (e) {
      console.error('Error synchronizing tokens from session:', e);
    }
  }
};

// API Error Store for global error handling
export const useApiErrorStore = create<{
  error: ApiError | null;
  setError: (error: ApiError) => void;
  clearError: () => void;
}>((set) => ({
  error: null,
  setError: (error: ApiError) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Create the API client
const createApiClient = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Main API client with interceptors
  const apiClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Auth-specific client (without token refresh to avoid circular references)
  const authClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Add auth token to requests
  apiClient.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Handle 401 errors and token refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const { response } = error;
      
      // Handle expired tokens (401 Unauthorized)
      if (response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            clearTokens();
            window.location.href = '/';
            return Promise.reject(new Error('No refresh token available'));
          }
          
          // Get new tokens
          const refreshResponse = await authClient.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          
          const data = refreshResponse.data as any;
          if (data.access_token) {
            setTokens(data.access_token, data.refresh_token);
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }
      
      // Global error handling
      if (response?.data?.message && response?.status !== 401) {
        toast.error(response.data.message);
      }
      
      return Promise.reject(error);
    }
  );
  
  // Add retry for network errors
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      if (!config || !config.retries) return Promise.reject(error);
      
      if ((!response || response.status >= 500) && config.retries > 0) {
        config.retries--;
        return apiClient(config);
      }
      
      return Promise.reject(error);
    }
  );
  
  // Simple wrapper functions
  return {
    get: <T>(url: string, params?: any, headers?: Record<string, string>) => {
      return apiClient.get<ApiResponse<T>>(url, { params, headers });
    },
    post: <T>(url: string, data?: any, headers?: Record<string, string>) => {
      return apiClient.post<ApiResponse<T>>(url, data, { headers });
    },
    put: <T>(url: string, data?: any, headers?: Record<string, string>) => {
      return apiClient.put<ApiResponse<T>>(url, data, { headers });
    },
    delete: <T>(url: string, data?: any, headers?: Record<string, string>) => {
      return apiClient.delete<ApiResponse<T>>(url, { data, headers });
    },
    // Auth specific methods (using authClient)
    auth: {
      login: async (email: string, password: string) => {
        const response = await authClient.post('/auth/login', {
          identifier: email,
          password,
          is_phone: false
        });
        
        const data = response.data as any;
        if (data.access_token) {
          setTokens(data.access_token, data.refresh_token);
        }
        
        return data;
      },
      refreshToken: async (refreshToken: string) => {
        const response = await authClient.post('/auth/refresh', {
          refresh_token: refreshToken
        });
        
        const data = response.data as any;
        if (data.access_token) {
          setTokens(data.access_token, data.refresh_token);
        }
        
        return data;
      },
      logout: () => {
        clearTokens();
      },
      getToken,
      getRefreshToken,
      setTokens,
      clearTokens,
      syncTokensFromSession
    }
  };
};

// Export a singleton instance
const api = createApiClient();
export default api;
