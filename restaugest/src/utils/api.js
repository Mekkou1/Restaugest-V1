import axios from 'axios';
import store from '../store';
import router from '../router';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle session expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh session
        const session = store.getters['auth/getSession'];
        if (session) {
          await store.dispatch('auth/refreshSession');
          const newToken = localStorage.getItem('token');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout and redirect to login
        await store.dispatch('auth/logout');
        router.push({
          name: 'Login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Unauthorized access
      router.push({ name: 'Home' });
    }

    // Network errors
    if (!error.response) {
      store.commit('SET_ERROR', 'Erreur de connexion au serveur');
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = token => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshSession: '/auth/refresh-session',
    updateActivity: '/auth/activity',
    me: '/auth/me'
  },
  // Users
  users: {
    list: '/users',
    create: '/users/register',
    update: id => `/users/${id}`,
    delete: id => `/users/${id}`,
    resetAttempts: id => `/users/${id}/reset-attempts`,
    updateStatus: id => `/users/${id}/status`
  },
  // Salles
  salles: {
    list: '/salles',
    create: '/salles',
    update: id => `/salles/${id}`,
    delete: id => `/salles/${id}`,
    tables: id => `/salles/${id}/tables`
  },
  // Tables
  tables: {
    list: '/tables',
    create: '/tables',
    update: id => `/tables/${id}`,
    delete: id => `/tables/${id}`,
    status: id => `/tables/${id}/status`
  },
  // Menu
  menu: {
    list: '/cartemenu',
    create: '/cartemenu',
    update: id => `/cartemenu/${id}`,
    delete: id => `/cartemenu/${id}`,
    bySalle: salleId => `/cartemenu/${salleId}`
  }
};

// Helper functions
export const handleError = error => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || 'Une erreur est survenue';
  } else if (error.request) {
    // Request made but no response
    return 'Impossible de contacter le serveur';
  } else {
    // Error in request setup
    return 'Erreur de configuration de la requête';
  }
};

export default api;
