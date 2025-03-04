import api from '../../utils/api';
import router from '../../router';
import { login as authLogin, logout as authLogout } from '../../utils/auth';

export default {
  namespaced: true,

  state: {
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    userRole: state => state.user?.role,
    hasError: state => state.error !== null,
    isLoading: state => state.loading,
    token: state => state.token,
    refreshToken: state => state.refreshToken
  },

  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const response = await authLogin(credentials);
        const { token, refreshToken, user } = response;

        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Update state
        commit('SET_AUTH_SUCCESS', { token, refreshToken, user });

        // Set default Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return user;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Erreur lors de la connexion');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async logout({ commit }) {
      try {
        await authLogout();
      } catch (error) {
        console.error('Logout error:', error);
      }

      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Update state
      commit('CLEAR_AUTH');

      // Remove Authorization header
      delete api.defaults.headers.common['Authorization'];

      // Redirect to login
      router.push('/login');
    },

    async refreshToken({ commit, state }) {
      try {
        const response = await api.post('/api/auth/refresh', {
          refreshToken: state.refreshToken
        });

        const { token } = response.data;

        // Update token
        localStorage.setItem('token', token);
        commit('SET_TOKEN', token);

        // Update Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return token;
      } catch (error) {
        commit('CLEAR_AUTH');
        throw error;
      }
    },

    async checkAuth({ commit, dispatch }) {
      try {
        const response = await api.get('/api/auth/verify');
        commit('SET_USER', response.data.user);
        return true;
      } catch (error) {
        if (error.response?.status === 401) {
          try {
            await dispatch('refreshToken');
            return true;
          } catch (refreshError) {
            dispatch('logout');
            return false;
          }
        }
        return false;
      }
    },

    updateUser({ commit }, user) {
      localStorage.setItem('user', JSON.stringify(user));
      commit('SET_USER', user);
    }
  },

  mutations: {
    SET_AUTH_SUCCESS(state, { token, refreshToken, user }) {
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
    },

    SET_TOKEN(state, token) {
      state.token = token;
    },

    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = true;
    },

    SET_LOADING(state, loading) {
      state.loading = loading;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    CLEAR_AUTH(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  }
};
