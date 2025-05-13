import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (response?.data?.message) {
      toast.error(response.data.message);
    }

    return Promise.reject(error);
  }
);

// Retry interceptor
api.interceptors.response.use(undefined, async (err) => {
  const { config, response } = err;
  if (!config || !config.retries) return Promise.reject(err);

  // Only retry on network errors or 5xx errors
  if (!response && config.retries > 0) {
    config.retries--;
    return api(config);
  }

  return Promise.reject(err);
});

export const apiClient = {
  get: <T>(url: string, params?: any, headers?: Record<string, string>) => {
    return api.get<ApiResponse<T>>(url, { params, headers });
  },
  post: <T>(url: string, data?: any, headers?: Record<string, string>) => {
    return api.post<ApiResponse<T>>(url, data, { headers });
  },
  put: <T>(url: string, data?: any, headers?: Record<string, string>) => {
    return api.put<ApiResponse<T>>(url, data, { headers });
  },
  delete: <T>(url: string, data?: any, headers?: Record<string, string>) => {
    return api.delete<ApiResponse<T>>(url, { data, headers });
  },
};

// API error store for global error handling
export const useApiErrorStore = create((set) => ({
  error: null as ApiError | null,
  setError: (error: ApiError) => set({ error }),
  clearError: () => set({ error: null }),
}));
