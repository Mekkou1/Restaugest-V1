import api from '@/utils/api';

const state = {
  caisse: {
    id: null,
    nom: '',
    etat: 'FERMEE',
    solde: 0,
    operations_jour: 0
  },
  derniereCloture: null,
  stats: {
    nombre_tickets: 0,
    chiffre_affaires: 0,
    total_remises: 0,
    total_avoirs: 0
  },
  repartitionModes: [],
  alertes: [],
  ticketEnCours: null,
  modesDisponibles: [],
  remisesDisponibles: [],
  loading: false,
  error: null
};

const getters = {
  isCaisseOuverte: state => state.caisse.etat === 'OUVERTE',
  soldeActuel: state => state.caisse.solde,
  hasAlertes: state => state.alertes.length > 0,
  statsJour: state => state.stats,
  ticketActif: state => state.ticketEnCours,
  modesActifs: state => state.modesDisponibles.filter(m => m.actif),
  remisesActives: state => state.remisesDisponibles.filter(r => r.actif),
  derniereCloture: state => state.derniereCloture,
  repartitionPaiements: state => state.repartitionModes
};

const actions = {
  // Chargement initial des données
  async loadCaisseData({ commit }) {
    commit('SET_LOADING', true);
    try {
      const [
        caisseRes,
        statsRes,
        modesRes,
        remisesRes,
        alertesRes
      ] = await Promise.all([
        api.get('/caisse/current'),
        api.get('/caisse/stats/jour'),
        api.get('/caisse/modes-paiement'),
        api.get('/caisse/remises'),
        api.get('/caisse/alertes')
      ]);

      commit('SET_CAISSE', caisseRes.data);
      commit('SET_STATS', statsRes.data);
      commit('SET_MODES_PAIEMENT', modesRes.data);
      commit('SET_REMISES', remisesRes.data);
      commit('SET_ALERTES', alertesRes.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Gestion de la caisse
  async ouvrirCaisse({ commit }, { montant, commentaire }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post('/caisse/ouvrir', {
        montant,
        commentaire
      });
      commit('SET_CAISSE', response.data);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fermerCaisse({ commit }, data) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post('/caisse/fermer', data);
      commit('SET_CAISSE', response.data);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Gestion des tickets
  async creerTicket({ commit }, ticket) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post('/caisse/tickets', ticket);
      commit('SET_TICKET_EN_COURS', response.data);
      return { success: true, ticket: response.data };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async encaisserTicket({ commit }, { ticketId, paiement }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post(`/caisse/tickets/${ticketId}/encaisser`, paiement);
      commit('SET_TICKET_EN_COURS', null);
      commit('UPDATE_STATS', response.data.stats);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async annulerTicket({ commit }, { ticketId, motif }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post(`/caisse/tickets/${ticketId}/annuler`, { motif });
      commit('SET_TICKET_EN_COURS', null);
      commit('UPDATE_STATS', response.data.stats);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Gestion des remises
  async appliquerRemise({ commit }, { ticketId, remise }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post(`/caisse/tickets/${ticketId}/remise`, remise);
      commit('SET_TICKET_EN_COURS', response.data.ticket);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Gestion des alertes
  async traiterAlerte({ commit }, alerteId) {
    try {
      await api.put(`/caisse/alertes/${alerteId}/traiter`);
      commit('REMOVE_ALERTE', alerteId);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.message);
      return { success: false, error: error.message };
    }
  },

  // Rafraîchissement des données
  async refreshStats({ commit }) {
    try {
      const response = await api.get('/caisse/stats/jour');
      commit('SET_STATS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    }
  },

  async refreshRepartition({ commit }) {
    try {
      const response = await api.get('/caisse/repartition-modes');
      commit('SET_REPARTITION_MODES', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    }
  }
};

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  },

  SET_CAISSE(state, caisse) {
    state.caisse = caisse;
  },

  SET_STATS(state, stats) {
    state.stats = stats;
  },

  UPDATE_STATS(state, stats) {
    state.stats = { ...state.stats, ...stats };
  },

  SET_MODES_PAIEMENT(state, modes) {
    state.modesDisponibles = modes;
  },

  SET_REMISES(state, remises) {
    state.remisesDisponibles = remises;
  },

  SET_ALERTES(state, alertes) {
    state.alertes = alertes;
  },

  REMOVE_ALERTE(state, alerteId) {
    state.alertes = state.alertes.filter(a => a.id !== alerteId);
  },

  SET_TICKET_EN_COURS(state, ticket) {
    state.ticketEnCours = ticket;
  },

  SET_DERNIERE_CLOTURE(state, cloture) {
    state.derniereCloture = cloture;
  },

  SET_REPARTITION_MODES(state, repartition) {
    state.repartitionModes = repartition;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
