import api from '../../utils/api';

export default {
  namespaced: true,

  state: {
    carteMenu: [],
    loading: false,
    error: null,
    selectedSalle: null
  },

  getters: {
    getCarteMenu: state => state.carteMenu,
    isLoading: state => state.loading,
    getError: state => state.error,
    getSelectedSalle: state => state.selectedSalle
  },

  actions: {
    async fetchCarteMenu({ commit }, salleId) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get(`/cartemenu/${salleId}`);
        commit('SET_CARTE_MENU', response.data);
        commit('SET_SELECTED_SALLE', salleId);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async addMenuItem({ commit, dispatch }, { salleId, item }) {
      commit('SET_LOADING', true);
      try {
        await api.post('/cartemenu', {
          salle_id: salleId,
          ...item
        });
        dispatch('fetchCarteMenu', salleId);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateMenuItem({ commit, dispatch }, { salleId, itemId, updates }) {
      commit('SET_LOADING', true);
      try {
        await api.put(`/cartemenu/${itemId}`, updates);
        dispatch('fetchCarteMenu', salleId);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async removeMenuItem({ commit, dispatch }, { salleId, itemId }) {
      commit('SET_LOADING', true);
      try {
        await api.delete(`/cartemenu/${itemId}`);
        dispatch('fetchCarteMenu', salleId);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async toggleItemVisibility({ commit, dispatch }, { salleId, itemId, visible }) {
      commit('SET_LOADING', true);
      try {
        await api.put(`/cartemenu/${itemId}`, { visible });
        dispatch('fetchCarteMenu', salleId);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },

  mutations: {
    SET_CARTE_MENU(state, menu) {
      state.carteMenu = menu;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_SELECTED_SALLE(state, salleId) {
      state.selectedSalle = salleId;
    }
  }
};
