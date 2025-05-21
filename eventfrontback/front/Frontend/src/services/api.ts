// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'http://localhost:9191/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Ajouter un timeout plus long pour éviter les problèmes de connexion
  timeout: 30000,
});

// Add request interceptor for auth and logging
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log request details in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config);
  }

  return config;
}, (error) => {
  console.error('❌ Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log response details in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response);
    }
    return response;
  },
  (error) => {
    // Log error details
    console.error('❌ API Error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }

    return Promise.reject(error);
  }
);

export default apiClient;