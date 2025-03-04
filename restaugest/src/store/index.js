import { createStore } from 'vuex';
import auth from './modules/auth';
import caisse from './modules/caisse';
import serveur from './modules/server';
import cuisine from './modules/cuisine';
import stock from './modules/stock';
import admin from './modules/admin';
import commandes from './modules/commandes';
import tables from './modules/tables';
import menu from './modules/menu';
import utilisateurs from './modules/utilisateurs';
import stats from './modules/stats';

const store = createStore({
  modules: {
    auth,
    caisse,
    serveur,
    cuisine,
    stock,
    admin,
    commandes,
    tables,
    menu,
    utilisateurs,
    stats
  },

  // Global state
  state: {
    loading: false,
    error: null,
    notifications: [],
    settings: {
      theme: localStorage.getItem('theme') || 'light',
      language: localStorage.getItem('language') || 'fr'
    }
  },

  // Global getters
  getters: {
    isLoading: state => state.loading,
    hasError: state => state.error !== null,
    getError: state => state.error,
    getNotifications: state => state.notifications,
    getSettings: state => state.settings
  },

  // Global mutations
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        ...notification
      });
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    UPDATE_SETTING(state, { key, value }) {
      state.settings[key] = value;
      localStorage.setItem(key, value);
    }
  },

  // Global actions
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading);
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error);
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    },
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
      if (notification.timeout !== false) {
        setTimeout(() => {
          commit('REMOVE_NOTIFICATION', notification.id);
        }, notification.timeout || 5000);
      }
    },
    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    },
    updateSetting({ commit }, payload) {
      commit('UPDATE_SETTING', payload);
    },
    initializeStore({ commit, dispatch }) {
      // Initialize theme
      const theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      commit('UPDATE_SETTING', { key: 'theme', value: theme });

      // Initialize language
      const language = localStorage.getItem('language') || 'fr';
      commit('UPDATE_SETTING', { key: 'language', value: language });

      // Check authentication status
      if (localStorage.getItem('token')) {
        dispatch('auth/checkAuth');
      }
    }
  }
});

// Plugin to save certain state to localStorage
store.subscribe((mutation, state) => {
  // Save settings when they change
  if (mutation.type === 'UPDATE_SETTING') {
    localStorage.setItem('settings', JSON.stringify(state.settings));
  }
});

export default store;
