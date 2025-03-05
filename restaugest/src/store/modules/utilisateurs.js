import api from '../../utils/api';

export default {
  namespaced: true,

  state: {
    users: [],
    loading: false,
    error: null,
    currentUser: null
  },

  getters: {
    getUsers: state => state.users,
    isLoading: state => state.loading,
    getError: state => state.error,
    getCurrentUser: state => state.currentUser,
    getActiveUsers: state => state.users.filter(user => user.etat === 'Actif'),
    getUsersByRole: state => role => state.users.filter(user => user.role === role),
    getBlockedUsers: state => state.users.filter(user => user.etat === 'Suspendu' || user.bloque_jusqu_a > new Date())
  },

  mutations: {
    SET_USERS(state, users) {
      state.users = users;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
    },
    ADD_USER(state, user) {
      state.users.push(user);
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
      }
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter(user => user.id !== userId);
    }
  },

  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/users');
        commit('SET_USERS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createUser({ commit }, userData) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/users/register', userData);
        const newUser = { ...userData, id: response.data.userId };
        commit('ADD_USER', newUser);
        return newUser;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateUser({ commit }, userData) {
      commit('SET_LOADING', true);
      try {
        await api.put(`/users/${userData.id}`, userData);
        commit('UPDATE_USER', userData);
        return userData;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteUser({ commit }, userId) {
      commit('SET_LOADING', true);
      try {
        await api.delete(`/users/${userId}`);
        commit('REMOVE_USER', userId);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async getUserById({ commit }, userId) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get(`/users/${userId}`);
        commit('SET_CURRENT_USER', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateUserStatus({ commit }, { userId, etat }) {
      commit('SET_LOADING', true);
      try {
        await api.patch(`/users/${userId}/status`, { etat });
        commit('UPDATE_USER', { id: userId, etat });
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async resetLoginAttempts({ commit }, userId) {
      commit('SET_LOADING', true);
      try {
        await api.post(`/users/${userId}/reset-attempts`);
        const response = await api.get(`/users/${userId}`);
        commit('UPDATE_USER', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.error || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  }
};
