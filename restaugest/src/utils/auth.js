import api from './api';

export const login = async (credentials) => {
  console.log('Auth login request:', credentials);
  try {
    const response = await api.post('/auth/login', credentials);
    console.log('Auth login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Auth login error:', error);
    throw error;
  }
};

export const logout = async () => {
  console.log('Auth logout request');
  try {
    const response = await api.post('/auth/logout');
    console.log('Auth logout response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Auth logout error:', error);
    throw error;
  }
};

export const checkAuth = () => {
  const token = localStorage.getItem('token');
  console.log('Auth check - token exists:', !!token);
  return !!token;
};

export const checkSession = async (pseudo) => {
  console.log('Auth session check request for:', pseudo);
  try {
    const response = await api.get('/auth/check', {
      params: { pseudo }
    });
    console.log('Auth session check response:', response.data);
    return response.data.active;
  } catch (error) {
    console.error('Auth session check error:', error);
    return false;
  }
};
