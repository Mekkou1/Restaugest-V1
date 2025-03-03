<template>
    <div class="alertes-caisse">
      <!-- En-tête avec compteurs -->
      <div class="header-section">
        <h2>Alertes et Notifications</h2>
        <div class="counters">
          <div 
            class="counter-badge"
            :class="{ 'has-alerts': alertesUrgentes.length > 0 }"
          >
            <i class="fas fa-exclamation-triangle"></i>
            {{ alertesUrgentes.length }} urgentes
          </div>
          <div 
            class="counter-badge"
            :class="{ 'has-alerts': alertesNonLues.length > 0 }"
          >
            <i class="fas fa-bell"></i>
            {{ alertesNonLues.length }} non lues
          </div>
        </div>
      </div>
  
      <!-- Filtres -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Rechercher une alerte..."
          >
        </div>
        <div class="filter-options">
          <select v-model="filterType" class="filter-select">
            <option value="">Tous les types</option>
            <option value="URGENT">Urgentes</option>
            <option value="WARNING">Avertissements</option>
            <option value="INFO">Informations</option>
          </select>
          <select v-model="filterStatus" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolues</option>
          </select>
        </div>
      </div>
      <div v-if="newAlert" class="alert alert-success">
        Nouvelle alerte reçue: {{ newAlert.titre }}
      </div>
      <!-- Liste des alertes -->
      <div class="alertes-list">
        <div 
          v-for="alerte in filteredAlertes"
          :key="alerte.id"
          class="alerte-card"
          :class="[
            getAlerteTypeClass(alerte.type),
            { 'non-lue': !alerte.lue }
          ]"
          @click="voirDetails(alerte)"
        >
          <div class="alerte-header">
            <div class="alerte-type">
              <i :class="getAlerteIcon(alerte.type)"></i>
              <span>{{ alerte.type }}</span>
            </div>
            <div class="alerte-time">
              {{ formatDateTime(alerte.date_creation) }}
            </div>
          </div>
  
          <div class="alerte-content">
            <h4>{{ alerte.titre }}</h4>
            <p>{{ alerte.description }}</p>
            
            <div v-if="alerte.montant" class="alerte-montant">
              <span class="label">Montant concerné:</span>
              <span class="amount">{{ formatPrice(alerte.montant) }}</span>
            </div>
  
            <div v-if="alerte.caisse" class="alerte-source">
              <span class="label">Caisse:</span>
              <span>{{ alerte.caisse.nom }}</span>
            </div>
          </div>
  
          <div class="alerte-footer">
            <div class="alerte-status">
              <span 
                class="status-badge"
                :class="getStatusClass(alerte.status)"
              >
                {{ alerte.status }}
              </span>
            </div>
            <div class="alerte-actions">
              <button 
                v-if="alerte.status === 'PENDING'"
                class="btn-action"
                @click.stop="traiterAlerte(alerte)"
              >
                <i class="fas fa-play"></i>
                Traiter
              </button>
              <button 
                v-if="alerte.status === 'IN_PROGRESS'"
                class="btn-action"
                @click.stop="resoudreAlerte(alerte)"
              >
                <i class="fas fa-check"></i>
                Résoudre
              </button>
              <button 
                class="btn-icon"
                @click.stop="marquerCommeLue(alerte)"
                :title="alerte.lue ? 'Marquer comme non lue' : 'Marquer comme lue'"
              >
                <i :class="alerte.lue ? 'far fa-envelope-open' : 'fas fa-envelope'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de détails -->
      <div class="modal" :class="{ 'show': showDetails }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Détails de l'alerte</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeDetails"
              ></button>
            </div>
            <div class="modal-body" v-if="selectedAlerte">
              <div class="alerte-details">
                <div class="detail-row">
                  <span class="label">Type:</span>
                  <span 
                    class="type-badge"
                    :class="getAlerteTypeClass(selectedAlerte.type)"
                  >
                    {{ selectedAlerte.type }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>{{ formatDateTime(selectedAlerte.date_creation) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Statut:</span>
                  <span 
                    class="status-badge"
                    :class="getStatusClass(selectedAlerte.status)"
                  >
                    {{ selectedAlerte.status }}
                  </span>
                </div>
              </div>
  
              <div class="alerte-description">
                <h4>{{ selectedAlerte.titre }}</h4>
                <p>{{ selectedAlerte.description }}</p>
              </div>
  
              <div v-if="selectedAlerte.historique?.length" class="alerte-historique">
                <h4>Historique</h4>
                <div 
                  v-for="(event, index) in selectedAlerte.historique"
                  :key="index"
                  class="historique-item"
                >
                  <div class="event-time">
                    {{ formatDateTime(event.date) }}
                  </div>
                  <div class="event-content">
                    <strong>{{ event.utilisateur }}:</strong>
                    {{ event.action }}
                  </div>
                </div>
              </div>
  
              <div v-if="selectedAlerte.commentaires?.length" class="alerte-commentaires">
                <h4>Commentaires</h4>
                <div 
                  v-for="comment in selectedAlerte.commentaires"
                  :key="comment.id"
                  class="commentaire-item"
                >
                  <div class="comment-header">
                    <strong>{{ comment.utilisateur }}</strong>
                    <span>{{ formatDateTime(comment.date) }}</span>
                  </div>
                  <p>{{ comment.texte }}</p>
                </div>
              </div>
  
              <div class="nouveau-commentaire">
                <textarea 
                  v-model="nouveauCommentaire"
                  class="form-control"
                  rows="3"
                  placeholder="Ajouter un commentaire..."
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeDetails"
              >
                Fermer
              </button>
              <button 
                v-if="nouveauCommentaire"
                type="button" 
                class="btn btn-primary"
                @click="ajouterCommentaire"
              >
                Ajouter le commentaire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useStore } from 'vuex';
  import api from '@/utils/api';
  
  export default {
    name: 'AlertesCaisse',
  
    setup() {
      const store = useStore();
  
      // État
      const alertes = ref([]);
      const searchQuery = ref('');
      const filterType = ref('');
      const filterStatus = ref('');
      const showDetails = ref(false);
      const selectedAlerte = ref(null);
      const nouveauCommentaire = ref('');
      let pollingInterval = null;
  
      // Computed
      const alertesUrgentes = computed(() => {
        return alertes.value.filter(a => a.type === 'URGENT' && a.status !== 'RESOLVED');
      });
  
      const alertesNonLues = computed(() => {
        return alertes.value.filter(a => !a.lue);
      });
  
      const filteredAlertes = computed(() => {
        return alertes.value.filter(alerte => {
          const matchQuery = alerte.titre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           alerte.description.toLowerCase().includes(searchQuery.value.toLowerCase());
          const matchType = !filterType.value || alerte.type === filterType.value;
          const matchStatus = !filterStatus.value || alerte.status === filterStatus.value;
          return matchQuery && matchType && matchStatus;
        });
      });
  
      // Méthodes
      const loadAlertes = async () => {
        try {
          const response = await api.get('/alertes/caisse');
          alertes.value = response.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des alertes'
          });
        }
      };
  
      const voirDetails = (alerte) => {
        selectedAlerte.value = alerte;
        showDetails.value = true;
        if (!alerte.lue) {
          marquerCommeLue(alerte);
        }
      };
  
      const closeDetails = () => {
        showDetails.value = false;
        selectedAlerte.value = null;
        nouveauCommentaire.value = '';
      };
  
      const traiterAlerte = async (alerte) => {
        try {
          await api.put(`/alertes/${alerte.id}/traiter`);
          await loadAlertes();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du traitement de l\'alerte'
          });
        }
      };
  
      const resoudreAlerte = async (alerte) => {
        try {
          await api.put(`/alertes/${alerte.id}/resoudre`);
          await loadAlertes();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la résolution de l\'alerte'
          });
        }
      };
  
      const marquerCommeLue = async (alerte) => {
        try {
          await api.put(`/alertes/${alerte.id}/lue`, {
            lue: !alerte.lue
          });
          await loadAlertes();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du marquage de l\'alerte'
          });
        }
      };
  
      const ajouterCommentaire = async () => {
        if (!nouveauCommentaire.value.trim()) return;
  
        try {
          await api.post(`/alertes/${selectedAlerte.value.id}/commentaires`, {
            texte: nouveauCommentaire.value
          });
          
          // Recharger les détails de l'alerte
          const response = await api.get(`/alertes/${selectedAlerte.value.id}`);
          selectedAlerte.value = response.data;
          nouveauCommentaire.value = '';
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'ajout du commentaire'
          });
        }
      };
  
      const getAlerteTypeClass = (type) => {
        const classes = {
          'URGENT': 'type-urgent',
          'WARNING': 'type-warning',
          'INFO': 'type-info'
        };
        return classes[type] || '';
      };
  
      const getAlerteIcon = (type) => {
        const icons = {
          'URGENT': 'fas fa-exclamation-triangle',
          'WARNING': 'fas fa-exclamation-circle',
          'INFO': 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-bell';
      };
  
      const getStatusClass = (status) => {
        const classes = {
          'PENDING': 'status-pending',
          'IN_PROGRESS': 'status-progress',
          'RESOLVED': 'status-resolved'
        };
        return classes[status] || '';
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      const formatDateTime = (date) => {
        return new Date(date).toLocaleString('fr-FR');
      };
  
      // Polling des alertes
      const startPolling = () => {
        pollingInterval = setInterval(loadAlertes, 30000); // 30 secondes
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadAlertes();
        startPolling();
      });
  
      onBeforeUnmount(() => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      });
  
      return {
        alertes,
        searchQuery,
        filterType,
        filterStatus,
        showDetails,
        selectedAlerte,
        nouveauCommentaire,
        alertesUrgentes,
        alertesNonLues,
        filteredAlertes,
        voirDetails,
        closeDetails,
        traiterAlerte,
        resoudreAlerte,
        marquerCommeLue,
        ajouterCommentaire,
        getAlerteTypeClass,
        getAlerteIcon,
        getStatusClass,
        formatPrice,
        formatDateTime
      };
    }
  };
  </script>
  
  <style scoped>
  .alertes-caisse {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .counters {
    display: flex;
    gap: 1rem;
  }
  
  .counter-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .counter-badge.has-alerts {
    background: #fff3cd;
    color: #664d03;
  }
  
  .filters-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .search-box {
    position: relative;
    flex: 1;
  }
  
  .search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  
  .filter-options {
    display: flex;
    gap: 1rem;
  }
  
  .filter-select {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    min-width: 150px;
  }
  
  .alertes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .alerte-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .alerte-card:hover {
    transform: translateY(-2px);
  }
  
  .alerte-card.non-lue {
    border-left: 4px solid #ff6600;
  }
  
  .alerte-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .alerte-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .alerte-time {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .alerte-content {
    padding: 1rem;
  }
  
  .alerte-content h4 {
    margin: 0 0 0.5rem;
  }
  
  .alerte-content p {
    margin: 0;
    color: #6c757d;
  }
  
  .alerte-montant {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
  
  .alerte-source {
    margin-top: 0.5rem;
  }
  
  .label {
    color: #6c757d;
    margin-right: 0.5rem;
  }
  
  .amount {
    font-weight: 500;
    color: #ff6600;
  }
  
  .alerte-footer {
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }
  
  .alerte-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-action {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-icon {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
  }
  
  /* Types d'alertes */
  .type-urgent {
    background: #f8d7da;
    color: #842029;
  }
  
  .type-warning {
    background: #fff3cd;
    color: #664d03;
  }
  
  .type-info {
    background: #cfe2ff;
    color: #084298;
  }
  
  /* Statuts */
  .status-pending {
    background: #fff3cd;
    color: #664d03;
  }
  
  .status-progress {
    background: #cfe2ff;
    color: #084298;
  }
  
  .status-resolved {
    background: #d1e7dd;
    color: #0f5132;
  }
  
  /* Modal styles */
  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
  }
  
  .modal.show {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-dialog {
    width: 100%;
    max-width: 600px;
    margin: 1rem;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .alerte-details {
    margin-bottom: 1.5rem;
  }
  
  .detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .alerte-description {
    margin-bottom: 1.5rem;
  }
  
  .alerte-historique {
    margin-bottom: 1.5rem;
  }
  
  .historique-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid #dee2e6;
  }
  
  .event-time {
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .alerte-commentaires {
    margin-bottom: 1.5rem;
  }
  
  .commentaire-item {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .nouveau-commentaire {
    margin-top: 1.5rem;
  }
  
  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    resize: vertical;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .alertes-caisse {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .counters {
      width: 100%;
      justify-content: space-between;
    }
  
    .filters-section {
      flex-direction: column;
    }
  
    .filter-options {
      width: 100%;
    }
  
    .filter-select {
      flex: 1;
    }
  
    .alertes-list {
      grid-template-columns: 1fr;
    }
  }
  </style>
  