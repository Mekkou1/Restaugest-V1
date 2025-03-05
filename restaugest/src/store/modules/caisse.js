import api from '@/utils/api';

export default {
  namespaced: true,

  state: {
    stats: {
      dailyTotal: 0,
      pendingTickets: 0,
      paidTickets: 0,
      averageTicket: 0
    },
    cashierStats: {
      float: 0,
      cash: 0,
      card: 0,
      total: 0
    },
    pendingTickets: [],
    currentTicket: null,
    loading: false,
    error: null
  },

  getters: {
    getStats: state => state.stats,
    getCashierStats: state => state.cashierStats,
    getPendingTickets: state => state.pendingTickets,
    getCurrentTicket: state => state.currentTicket,
    isLoading: state => state.loading,
    getError: state => state.error
  },

  mutations: {
    SET_STATS(state, stats) {
      state.stats = stats;
    },
    SET_CASHIER_STATS(state, stats) {
      state.cashierStats = stats;
    },
    SET_PENDING_TICKETS(state, tickets) {
      state.pendingTickets = tickets;
    },
    SET_CURRENT_TICKET(state, ticket) {
      state.currentTicket = ticket;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_TICKET(state, ticket) {
      state.pendingTickets.push(ticket);
      state.stats.pendingTickets++;
    },
    UPDATE_TICKET(state, updatedTicket) {
      const index = state.pendingTickets.findIndex(t => t.id === updatedTicket.id);
      if (index !== -1) {
        state.pendingTickets.splice(index, 1, updatedTicket);
      }
    },
    REMOVE_TICKET(state, ticketId) {
      state.pendingTickets = state.pendingTickets.filter(t => t.id !== ticketId);
      state.stats.pendingTickets--;
      state.stats.paidTickets++;
    }
  },

  actions: {
    async fetchDashboardStats({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/caisse/stats/dashboard');
        commit('SET_STATS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchCashierStats({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/caisse/stats/cashier');
        commit('SET_CASHIER_STATS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchPendingTickets({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/caisse/tickets/pending');
        commit('SET_PENDING_TICKETS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createTicket({ commit }, ticketData) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/caisse/tickets', ticketData);
        commit('ADD_TICKET', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateTicket({ commit }, { ticketId, updates }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.put(`/caisse/tickets/${ticketId}`, updates);
        commit('UPDATE_TICKET', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async processPayment({ commit }, { ticketId, paymentData }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/caisse/tickets/${ticketId}/payment`, paymentData);
        commit('REMOVE_TICKET', ticketId);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async openCashier({ commit }, floatAmount) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/caisse/open', { floatAmount });
        commit('SET_CASHIER_STATS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async closeCashier({ commit }, closingData) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/caisse/close', closingData);
        commit('SET_CASHIER_STATS', {
          float: 0,
          cash: 0,
          card: 0,
          total: 0
        });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async generateReport({ commit }, reportParams) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/caisse/reports', { params: reportParams });
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
