import { createStore } from 'vuex';
import api from '@/utils/api';

// Importation des modules
import caisse from './modules/caisse';
import serveur from './modules/serveur';
import cuisine from './modules/cuisine';
import stock from './modules/stock';
import admin from './modules/admin';
import commandes from './modules/commandes';
import tables from './modules/tables';
import menu from './modules/menu';
import utilisateurs from './modules/utilisateurs';
import stats from './modules/stats';

// Création du store avec tous les modules
const store = createStore({
  modules: {
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
  
  state: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    notifications: [],
    settings: {
      theme: 'light',
      language: 'fr',
      notifications: {
        sound: true,
        desktop: true
      }
    },
    systemStatus: {
      online: true,
      lastSync: null,
      version: process.env.VUE_APP_VERSION,
      maintenance: false
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    userRole: state => state.user?.role,
    currentUser: state => state.user,
    hasError: state => state.error !== null,
    isLoading: state => state.loading,
    notifications: state => state.notifications,
    settings: state => state.settings,
    isSystemOnline: state => state.systemStatus.online,
    isInMaintenance: state => state.systemStatus.maintenance,
    canAccessModule: (state) => (module) => {
      const rolePermissions = {
        'Administrateur': ['admin', 'caisse', 'cuisine', 'serveur', 'stock', 'stats'],
        'Caissier': ['caisse'],
        'Serveur': ['serveur'],
        'Cuisinier': ['cuisine']
      };
      return rolePermissions[state.user?.role]?.includes(module) || false;
    },
    userPermissions: state => state.user?.permissions || []
  },

  actions: {
    // Authentification
    async login({ commit, dispatch }, credentials) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/auth/login', credentials);
        commit('SET_USER', response.data.user);
        commit('SET_AUTHENTICATED', true);
        
        // Charger les données initiales selon le rôle
        await dispatch('loadInitialData');
        
        return { success: true };
      } catch (error) {
        commit('SET_ERROR', error.message);
        return { success: false, error: error.message };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async logout({ commit }) {
      try {
        await api.post('/auth/logout');
      } finally {
        // Réinitialiser tous les modules
        commit('RESET_ALL_MODULES');
        commit('SET_USER', null);
        commit('SET_AUTHENTICATED', false);
      }
    },

    async refreshToken({ commit }) {
      try {
        const response = await api.post('/auth/refresh');
        commit('UPDATE_TOKEN', response.data.token);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      }
    },

    // Chargement initial des données
    async loadInitialData({ dispatch, getters }) {
      const role = getters.userRole;
      
      switch (role) {
        case 'Administrateur':
          await Promise.all([
            dispatch('admin/loadDashboard'),
            dispatch('stats/loadGlobalStats'),
            dispatch('stock/loadInventaire')
          ]);
          break;
          
        case 'Caissier':
          await Promise.all([
            dispatch('caisse/loadCaisseData'),
            dispatch('commandes/loadCommandesEnCours')
          ]);
          break;
          
        case 'Serveur':
          await Promise.all([
            dispatch('serveur/loadTables'),
            dispatch('menu/loadCarteActive'),
            dispatch('commandes/loadCommandesServeur')
          ]);
          break;
          
        case 'Cuisinier':
          await Promise.all([
            dispatch('cuisine/loadCommandesEnPreparation'),
            dispatch('stock/loadStockCuisine')
          ]);
          break;
      }
    },

    // Gestion des notifications
    showNotification({ commit }, notification) {
      const id = Date.now();
      const notif = {
        id,
        timestamp: new Date(),
        ...notification
      };
      
      commit('ADD_NOTIFICATION', notif);
      
      // Auto-suppression après 5 secondes pour les notifications non persistantes
      if (!notification.persistent) {
        setTimeout(() => {
          commit('REMOVE_NOTIFICATION', id);
        }, 5000);
      }

      // Notification sonore si activée
      if (this.state.settings.notifications.sound) {
        const audio = new Audio('/notification.mp3');
        audio.play();
      }

      // Notification desktop si activée et supportée
      if (this.state.settings.notifications.desktop && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title || 'Restaugest', {
            body: notification.message,
            icon: '/icon.png'
          });
        }
      }
    },

    dismissNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    },

    // Gestion des paramètres
    updateSettings({ commit }, settings) {
      commit('UPDATE_SETTINGS', settings);
      localStorage.setItem('settings', JSON.stringify(settings));
    },

    // Gestion du système
    async checkSystemStatus({ commit }) {
      try {
        const response = await api.get('/system/status');
        commit('UPDATE_SYSTEM_STATUS', response.data);
      } catch (error) {
        commit('SET_SYSTEM_OFFLINE');
      }
    },

    // Gestion des erreurs
    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },

    SET_AUTHENTICATED(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },

    UPDATE_TOKEN(state, token) {
      // Mise à jour du token dans l'instance axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    SET_LOADING(state, loading) {
      state.loading = loading;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification);
    },

    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },

    UPDATE_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },

    UPDATE_SYSTEM_STATUS(state, status) {
      state.systemStatus = { ...state.systemStatus, ...status, online: true };
    },

    SET_SYSTEM_OFFLINE(state) {
      state.systemStatus.online = false;
    },

    RESET_ALL_MODULES(state) {
      // Réinitialiser l'état de tous les modules
      Object.keys(this.state).forEach(module => {
        if (this._modules.root._children[module]?.state) {
          this.commit(`${module}/RESET_STATE`);
        }
      });
    }
  }
});

// Plugin pour sauvegarder l'état dans le localStorage
store.subscribe((mutation, state) => {
  // Sauvegarder uniquement les données non sensibles
  const persistedData = {
    isAuthenticated: state.isAuthenticated,
    settings: state.settings,
    user: state.user ? {
      id: state.user.id,
      nom: state.user.nom,
      role: state.user.role,
      preferences: state.user.preferences
    } : null
  };
  localStorage.setItem('store', JSON.stringify(persistedData));
});

// Restaurer l'état depuis le localStorage
const persistedData = localStorage.getItem('store');
if (persistedData) {
  const { isAuthenticated, user, settings } = JSON.parse(persistedData);
  store.commit('SET_AUTHENTICATED', isAuthenticated);
  if (user) {
    store.commit('SET_USER', user);
  }
  if (settings) {
    store.commit('UPDATE_SETTINGS', settings);
  }
}

// Vérification périodique du statut du système
setInterval(() => {
  store.dispatch('checkSystemStatus');
}, 30000);

export default store;
