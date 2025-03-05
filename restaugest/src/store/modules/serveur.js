import api from '@/utils/api';

export default {
  namespaced: true,

  state: {
    salles: [],
    tables: [],
    assignedTables: [],
    activeOrders: [],
    currentService: null,
    loading: false,
    error: null
  },

  getters: {
    getSalles: state => state.salles,
    getTables: state => state.tables,
    getAssignedTables: state => state.assignedTables,
    getActiveOrders: state => state.activeOrders,
    getCurrentService: state => state.currentService,
    getTableById: state => id => state.tables.find(table => table.id === id),
    getTablesBySalle: state => salleId => state.tables.filter(table => table.salle_id === salleId),
    getOrdersByTable: state => tableId => state.activeOrders.filter(order => order.table_id === tableId),
    isLoading: state => state.loading,
    getError: state => state.error
  },

  mutations: {
    SET_SALLES(state, salles) {
      state.salles = salles;
    },
    SET_TABLES(state, tables) {
      state.tables = tables;
    },
    SET_ASSIGNED_TABLES(state, tables) {
      state.assignedTables = tables;
    },
    SET_ACTIVE_ORDERS(state, orders) {
      state.activeOrders = orders;
    },
    SET_CURRENT_SERVICE(state, service) {
      state.currentService = service;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_TABLE_STATUS(state, { tableId, status, serveurId }) {
      const table = state.tables.find(t => t.id === tableId);
      if (table) {
        table.status = status;
        if (serveurId) {
          table.serveur_id = serveurId;
        }
      }
    },
    ADD_ORDER(state, order) {
      state.activeOrders.push(order);
    },
    UPDATE_ORDER(state, updatedOrder) {
      const index = state.activeOrders.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        state.activeOrders.splice(index, 1, updatedOrder);
      }
    },
    REMOVE_ORDER(state, orderId) {
      state.activeOrders = state.activeOrders.filter(o => o.id !== orderId);
    }
  },

  actions: {
    async fetchSalles({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/serveur/salles');
        commit('SET_SALLES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchTables({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/serveur/tables');
        commit('SET_TABLES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchAssignedTables({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/serveur/tables/assigned');
        commit('SET_ASSIGNED_TABLES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchActiveOrders({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/serveur/orders/active');
        commit('SET_ACTIVE_ORDERS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async assignTable({ commit }, { tableId, serveurId }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/serveur/tables/${tableId}/assign`, { serveurId });
        commit('UPDATE_TABLE_STATUS', {
          tableId,
          status: 'assigned',
          serveurId
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createOrder({ commit }, orderData) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/serveur/orders', orderData);
        commit('ADD_ORDER', response.data);
        commit('UPDATE_TABLE_STATUS', {
          tableId: orderData.table_id,
          status: 'occupee'
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateOrder({ commit }, { orderId, updates }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.put(`/serveur/orders/${orderId}`, updates);
        commit('UPDATE_ORDER', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async completeOrder({ commit }, orderId) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/serveur/orders/${orderId}/complete`);
        commit('REMOVE_ORDER', orderId);
        // Update table status if this was the last order
        const tableId = response.data.table_id;
        const remainingOrders = state.activeOrders.filter(
          o => o.table_id === tableId && o.id !== orderId
        );
        if (remainingOrders.length === 0) {
          commit('UPDATE_TABLE_STATUS', {
            tableId,
            status: 'libre'
          });
        }
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async getCurrentService({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/serveur/service/current');
        commit('SET_CURRENT_SERVICE', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
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
