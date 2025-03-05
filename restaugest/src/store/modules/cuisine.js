import api from '@/utils/api';

export default {
  namespaced: true,

  state: {
    stats: {
      pendingOrders: 0,
      inProgressOrders: 0,
      readyOrders: 0,
      averageTime: 0
    },
    orders: {
      pending: [],
      inProgress: [],
      ready: []
    },
    loading: false,
    error: null
  },

  getters: {
    getStats: state => state.stats,
    getPendingOrders: state => state.orders.pending,
    getInProgressOrders: state => state.orders.inProgress,
    getReadyOrders: state => state.orders.ready,
    isLoading: state => state.loading,
    getError: state => state.error
  },

  mutations: {
    SET_STATS(state, stats) {
      state.stats = stats;
    },
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_ORDER_STATUS(state, { orderId, status, updatedOrder }) {
      // Remove from current status
      ['pending', 'inProgress', 'ready'].forEach(key => {
        state.orders[key] = state.orders[key].filter(order => order.id !== orderId);
      });

      // Add to new status if order data is provided
      if (updatedOrder) {
        switch (status) {
          case 'pending':
            state.orders.pending.push(updatedOrder);
            break;
          case 'inProgress':
            state.orders.inProgress.push(updatedOrder);
            break;
          case 'ready':
            state.orders.ready.push(updatedOrder);
            break;
        }
      }

      // Update stats
      state.stats = {
        ...state.stats,
        pendingOrders: state.orders.pending.length,
        inProgressOrders: state.orders.inProgress.length,
        readyOrders: state.orders.ready.length
      };
    },
    UPDATE_ORDER_ITEM(state, { orderId, itemId, completed }) {
      const order = state.orders.inProgress.find(o => o.id === orderId);
      if (order) {
        const item = order.items.find(i => i.id === itemId);
        if (item) {
          item.completed = completed;
        }
      }
    }
  },

  actions: {
    async fetchStats({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/cuisine/stats');
        commit('SET_STATS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchOrders({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/cuisine/orders');
        commit('SET_ORDERS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async startOrder({ commit }, orderId) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/cuisine/orders/${orderId}/start`);
        commit('UPDATE_ORDER_STATUS', {
          orderId,
          status: 'inProgress',
          updatedOrder: response.data
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async completeOrderItem({ commit }, { orderId, itemId }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/cuisine/orders/${orderId}/items/${itemId}/complete`);
        commit('UPDATE_ORDER_ITEM', {
          orderId,
          itemId,
          completed: true
        });
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
        const response = await api.post(`/cuisine/orders/${orderId}/complete`);
        commit('UPDATE_ORDER_STATUS', {
          orderId,
          status: 'ready',
          updatedOrder: response.data
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async cancelOrder({ commit }, { orderId, reason }) {
      commit('SET_LOADING', true);
      try {
        await api.post(`/cuisine/orders/${orderId}/cancel`, { reason });
        commit('UPDATE_ORDER_STATUS', {
          orderId,
          status: 'cancelled'
        });
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
