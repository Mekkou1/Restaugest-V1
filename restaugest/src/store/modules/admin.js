import api from '@/utils/api';

export default {
  namespaced: true,

  state: {
    dashboardStats: {
      activeUsers: 0,
      usersTrend: 0,
      dailyRevenue: 0,
      revenueTrend: 0,
      activeOrders: 0,
      completedOrders: 0,
      occupiedTables: 0,
      totalTables: 0
    },
    recentActivities: [],
    systemAlerts: [],
    loading: false,
    error: null
  },

  getters: {
    getDashboardStats: state => state.dashboardStats,
    getRecentActivities: state => state.recentActivities,
    getSystemAlerts: state => state.systemAlerts,
    isLoading: state => state.loading,
    getError: state => state.error,
    
    // Stats dérivés
    getOccupancyRate: state => {
      const { occupiedTables, totalTables } = state.dashboardStats;
      return totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
    },
    
    getOrderCompletionRate: state => {
      const { activeOrders, completedOrders } = state.dashboardStats;
      const totalOrders = activeOrders + completedOrders;
      return totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    }
  },

  mutations: {
    SET_DASHBOARD_STATS(state, stats) {
      state.dashboardStats = stats;
    },
    SET_RECENT_ACTIVITIES(state, activities) {
      state.recentActivities = activities;
    },
    SET_SYSTEM_ALERTS(state, alerts) {
      state.systemAlerts = alerts;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_ACTIVITY(state, activity) {
      state.recentActivities.unshift(activity);
      if (state.recentActivities.length > 50) {
        state.recentActivities.pop();
      }
    },
    ADD_SYSTEM_ALERT(state, alert) {
      state.systemAlerts.unshift(alert);
    },
    REMOVE_SYSTEM_ALERT(state, alertId) {
      state.systemAlerts = state.systemAlerts.filter(alert => alert.id !== alertId);
    },
    UPDATE_DASHBOARD_STAT(state, { key, value }) {
      state.dashboardStats[key] = value;
    }
  },

  actions: {
    async fetchDashboardStats({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/admin/dashboard/stats');
        commit('SET_DASHBOARD_STATS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchRecentActivities({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/admin/activities/recent');
        commit('SET_RECENT_ACTIVITIES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchSystemAlerts({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/admin/alerts');
        commit('SET_SYSTEM_ALERTS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async resolveSystemAlert({ commit }, alertId) {
      commit('SET_LOADING', true);
      try {
        await api.post(`/admin/alerts/${alertId}/resolve`);
        commit('REMOVE_SYSTEM_ALERT', alertId);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async generateReport({ commit }, { reportType, params }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get(`/admin/reports/${reportType}`, { params });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateSystemSettings({ commit }, settings) {
      commit('SET_LOADING', true);
      try {
        const response = await api.put('/admin/settings', settings);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async backupDatabase({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/admin/database/backup');
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async restoreDatabase({ commit }, backupId) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/admin/database/restore/${backupId}`);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async getSystemLogs({ commit }, params) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/admin/logs', { params });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async monitorPerformance({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/admin/performance');
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    logActivity({ commit }, activity) {
      commit('ADD_ACTIVITY', {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...activity
      });
    },

    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  }
};
