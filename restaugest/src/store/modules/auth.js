import api from '../../utils/api';

export default {
  namespaced: true,

  state: {
    user: null,
    session: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },

  getters: {
    isAuthenticated: state => !!state.token,
    getUser: state => state.user,
    getSession: state => state.session,
    isLoading: state => state.loading,
    getError: state => state.error,
    isAdmin: state => state.user?.role === 'Administrateur',
    isCaissier: state => state.user?.role === 'Caissier',
    isServeur: state => state.user?.role === 'Serveur',
    isCuisinier: state => state.user?.role === 'Cuisinier'
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_SESSION(state, session) {
      state.session = session;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_LAST_ACTIVITY(state) {
      if (state.session) {
        state.session.last_activity = new Date().toISOString();
      }
    }
  },

  actions: {
    async login({ commit, dispatch }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await api.post('/auth/login', credentials);
        const { token, user, session } = response.data;
        
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        commit('SET_SESSION', session);
        
        // Start session monitoring
        dispatch('startSessionMonitoring');
        
        return user;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || 'Erreur de connexion');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async logout({ commit, state }) {
      try {
        if (state.session?.session_id) {
          await api.post('/auth/logout', { session_id: state.session.session_id });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        commit('SET_TOKEN', null);
        commit('SET_USER', null);
        commit('SET_SESSION', null);
      }
    },

    async refreshSession({ commit, state }) {
      try {
        const response = await api.post('/auth/refresh-session', {
          session_id: state.session?.session_id
        });
        commit('SET_SESSION', response.data.session);
      } catch (error) {
        console.error('Session refresh error:', error);
        throw error;
      }
    },

    async checkAuth({ commit, dispatch }) {
      if (!localStorage.getItem('token')) return;

      commit('SET_LOADING', true);
      try {
        const response = await api.get('/auth/me');
        const { user, session } = response.data;
        
        commit('SET_USER', user);
        commit('SET_SESSION', session);
        
        // Start session monitoring
        dispatch('startSessionMonitoring');
      } catch (error) {
        commit('SET_TOKEN', null);
        commit('SET_USER', null);
        commit('SET_SESSION', null);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    startSessionMonitoring({ dispatch, state }) {
      // Update last activity every minute
      setInterval(() => {
        if (state.session) {
          dispatch('updateLastActivity');
        }
      }, 60000);

      // Check session expiration every minute
      setInterval(() => {
        if (state.session) {
          const expiresAt = new Date(state.session.expires_at);
          const now = new Date();
          
          // If session expires in less than 5 minutes, try to refresh
          if ((expiresAt - now) < 300000) {
            dispatch('refreshSession');
          }
        }
      }, 60000);
    },

    async updateLastActivity({ commit, state }) {
      try {
        await api.post('/auth/activity', {
          session_id: state.session?.session_id
        });
        commit('UPDATE_LAST_ACTIVITY');
      } catch (error) {
        console.error('Update activity error:', error);
      }
    },

    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  }
};
