import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// API functions
export const checkAuth = () => {
  return !!localStorage.getItem('token');
};

export const checkSessionTimeout = async () => {
  try {
    await api.get('/auth/check');
    return true;
  } catch (error) {
    return false;
  }
};

export const extendSession = async () => {
  try {
    const response = await api.post('/auth/refresh');
    localStorage.setItem('token', response.data.token);
    return true;
  } catch (error) {
    return false;
  }
};

export const getServerStats = async () => {
  try {
    const response = await api.get('/stats/server');
    return response.data;
  } catch (error) {
    console.error('Error fetching server stats:', error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/stats/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// API modules
export const deviseAPI = {
  getAll: () => api.get('/devises'),
  create: (data) => api.post('/devises', data),
  update: (id, data) => api.put(`/devises/${id}`, data),
  delete: (id) => api.delete(`/devises/${id}`),
};

export const sallesAPI = {
  getAll: () => api.get('/salles'),
  getById: (id) => api.get(`/salles/${id}`),
  getTables: (salleId) => api.get(`/salles/${salleId}/tables`), // Récupérer les tables d'une salle
  create: (data) => api.post('/salles', data),
  update: (id, data) => api.put(`/salles/${id}`, data),
  delete: (id) => api.delete(`/salles/${id}`),
};

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  getById: (id) => api.get(`/tables/${id}`),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

export const cartemenuAPI = {
  getBySalle: (salleId) => api.get(`/cartemenu/${salleId}`), // Récupérer la carte menu d'une salle
};

export const ticketsAPI = {
  create: (data) => api.post('/tickets', data), // Créer un ticket
  getById: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
};

export const commandesAPI = {
  create: (data) => api.post('/commandes', data), // Créer une commande
  getByTicket: (ticketId) => api.get(`/commandes?ticket_id=${ticketId}`), // Récupérer les commandes d'un ticket
  update: (id, data) => api.put(`/commandes/${id}`, data),
  delete: (id) => api.delete(`/commandes/${id}`),
};

// Export the axios instance directly
export default api;