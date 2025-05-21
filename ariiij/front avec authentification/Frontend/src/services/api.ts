// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'http://localhost:9191/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth and content type
apiClient.interceptors.request.use((config) => {
  // Ajouter le token d'authentification s'il existe
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Gérer les en-têtes Content-Type en fonction du type de données
  if (config.data instanceof FormData) {
    // Pour les requêtes multipart/form-data, supprimer l'en-tête Content-Type
    // pour laisser le navigateur le définir avec la boundary
    delete config.headers['Content-Type'];
  } else if (typeof config.data === 'string' && config.data.startsWith('{')) {
    // Pour les requêtes JSON, s'assurer que Content-Type est application/json
    config.headers['Content-Type'] = 'application/json';
  }

  // Log pour le débogage
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data
  });

  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default apiClient;