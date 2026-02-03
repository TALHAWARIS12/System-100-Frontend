import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry logic for network errors
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= 3) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
        return api(originalRequest);
      }

      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission.');
      return Promise.reject(error);
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      toast.error('Server error. Our team has been notified.');
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error('Resource not found.');
      return Promise.reject(error);
    }

    // Generic error handling
    const message = error.response?.data?.message || 'An error occurred';
    if (!originalRequest._silent) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
