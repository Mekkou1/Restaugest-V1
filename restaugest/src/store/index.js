import { createStore } from 'vuex';
import api from '../utils/api';


export default createStore({
  state: {
    user: null,
    token: null,
    refreshToken: null,
    modals: {
      fonds: false
    }
  },

  mutations: {
    SET_USER(state, user) {
      // Flatten the user object structure
      state.user = user ? {
        id: user.id,
        pseudo: user.pseudo,
        role: user.role
      } : null;
    },
    SET_TOKENS(state, { token, refreshToken }) {
      state.token = token;
      state.refreshToken = refreshToken;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    CLEAR_USER(state) {
      state.user = null;
    },
    SET_MODAL_STATE(state, { modal, value }) {
      state.modals[modal] = value;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      console.log('Login action started with credentials:', credentials);
      try {
        const response = await api.post('/auth/login', credentials);
        console.log('Login response received:', response.data);

        
        if (response.data.token && response.data.refreshToken) {
          console.log('Valid tokens received, committing to store');
          commit('SET_USER', response.data.user);
          commit('SET_TOKENS', {
            token: response.data.token,
            refreshToken: response.data.refreshToken
          });
          console.log('Store updated successfully');
          return response.data;
        }
        console.error('Login failed: Missing tokens in response');
        throw new Error('Login failed');

      } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data
        });
        throw error;
      }
    },

    async refreshToken({ commit }) {
      console.log('Refresh token action started');
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('No refresh token available');
          throw new Error('No refresh token available');
        }
        
        const response = await api.post('/auth/refresh', { refreshToken });
        console.log('Refresh token response received:', response.data);

        
        if (response.data.token) {
          console.log('New tokens received, committing to store');
          commit('SET_TOKENS', {
            token: response.data.token,
            refreshToken: response.data.refreshToken
          });
          console.log('Store updated with new tokens');
          return response.data;
        }
        console.error('Token refresh failed: Missing token in response');
        throw new Error('Token refresh failed');

      } catch (error) {
        console.error('Token refresh error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data
        });
        throw error;
      }
    },


    setUser({ commit }, user) {
      commit('SET_USER', user);
    },
    clearUser({ commit }) {
      console.log('Clearing user data from store');
      commit('CLEAR_USER');
      commit('SET_TOKENS', { token: null, refreshToken: null });
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      console.log('Store cleared successfully');
    },

    logout({ dispatch }) {
      console.log('Logout action started');
      return new Promise((resolve) => {
        dispatch('clearUser');
        resolve();
      });
    },



    setModalState({ commit }, { modal, value }) {
      commit('SET_MODAL_STATE', { modal, value });
    }
  },

  getters: {
    isAuthenticated: state => !!state.token,
    userRole: state => state.user?.role,
    userId: state => state.user?.id,
    getModalState: state => modal => state.modals[modal],
    token: state => state.token,
    refreshToken: state => state.refreshToken
  }

});
