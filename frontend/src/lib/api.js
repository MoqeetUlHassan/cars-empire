import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to generate storage URLs
export const getStorageUrl = (path) => {
  if (!path) return null;
  return `${STORAGE_BASE_URL}/${path}`;
};

// Helper function to get placeholder image
export const getPlaceholderImage = (width = 400, height = 300, text = 'No Image') => {
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`;
};

export default api;
