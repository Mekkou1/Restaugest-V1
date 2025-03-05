import { createStore } from 'vuex';
import auth from './modules/auth';
import admin from './modules/admin';
import caisse from './modules/caisse';
import cuisine from './modules/cuisine';
import serveur from './modules/serveur';
import menu from './modules/menu';
import utilisateurs from './modules/utilisateurs';

export default createStore({
  state: {
    loading: false,
    error: null,
    notifications: [],
    settings: {
      theme: localStorage.getItem('theme') || 'light',
      language: localStorage.getItem('language') || 'fr',
      sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true'
    }
  },

  getters: {
    isLoading: state => state.loading,
    getError: state => state.error,
    getNotifications: state => state.notifications,
    getSettings: state => state.settings,
    getTheme: state => state.settings.theme,
    getLanguage: state => state.settings.language,
    isSidebarCollapsed: state => state.settings.sidebarCollapsed
  },

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
    },
    TOGGLE_SIDEBAR(state) {
      state.settings.sidebarCollapsed = !state.settings.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', state.settings.sidebarCollapsed);
    }
  },

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

    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR');
    },

    async initializeStore({ commit, dispatch }) {
      try {
        // Initialize theme
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        commit('UPDATE_SETTING', { key: 'theme', value: theme });

        // Initialize language
        const language = localStorage.getItem('language') || 'fr';
        commit('UPDATE_SETTING', { key: 'language', value: language });

        // Initialize sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        commit('UPDATE_SETTING', { key: 'sidebarCollapsed', value: sidebarCollapsed });

        // Check authentication status
        if (localStorage.getItem('token')) {
          await dispatch('auth/checkAuth');
        }
      } catch (error) {
        console.error('Store initialization error:', error);
      }
    }
  },

  modules: {
    auth,
    admin,
    caisse,
    cuisine,
    serveur,
    menu,
    utilisateurs
  }
});
