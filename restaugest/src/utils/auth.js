import api from './api';

// Fonction pour gérer la connexion
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    
    // Stocker les informations d'authentification
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Configurer le token pour les futures requêtes
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || { message: 'Erreur de connexion' };
  }
};

// Fonction pour gérer la déconnexion
export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Nettoyer le stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Fonction pour rafraîchir le token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/api/auth/refresh', { refreshToken });
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return token;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Fonction pour obtenir l'utilisateur actuel
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Fonction pour vérifier si l'utilisateur a un rôle spécifique
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Fonction pour vérifier si le token est expiré
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

// Fonction pour configurer l'intercepteur de requête
export const setupAuthInterceptor = () => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const token = await refreshToken();
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          await logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
