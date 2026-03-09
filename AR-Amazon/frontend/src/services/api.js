import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

// Models API
export const modelsAPI = {
  getAll: () => api.get('/models'),
  getOne: (id) => api.get(`/models/${id}`),
  create: (formData) => {
    return api.post('/models/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  checkQuality: (formData) => {
    return api.post('/models/check-quality', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  checkStatus: (id) => api.get(`/models/${id}/status`),
  delete: (id) => api.delete(`/models/${id}`)
};

// Meshy API
export const meshyAPI = {
  checkStatus: (taskId) => api.get(`/meshy/status/${taskId}`)
};

export default api;
