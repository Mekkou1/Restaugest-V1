import { createStore } from 'vuex';

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
    userRole: (state) => state.user?.role,
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
    // Actions go here
  },

  mutations: {
    // Mutations go here
  }
});

export default store;