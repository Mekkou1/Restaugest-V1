<template>
    <div class="avoir-manager">
      <!-- En-tête -->
      <div class="header-section">
        <h2>Gestion des Avoirs</h2>
        <div class="filters">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Rechercher un avoir..."
            >
          </div>
          <select v-model="filterStatus" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="utilise">Utilisés</option>
            <option value="expire">Expirés</option>
          </select>
        </div>
      </div>
  
      <!-- Liste des avoirs -->
      <div class="avoirs-list">
        <div 
          v-for="avoir in filteredAvoirs"
          :key="avoir.id"
          class="avoir-card"
          :class="getAvoirStatusClass(avoir)"
        >
          <div class="avoir-header">
            <div class="avoir-info">
              <span class="avoir-ref">#{{ avoir.reference }}</span>
              <span 
                class="status-badge"
                :class="getAvoirStatusClass(avoir)"
              >
                {{ getAvoirStatus(avoir) }}
              </span>
            </div>
            <div class="avoir-date">
              {{ formatDate(avoir.date_emission) }}
            </div>
          </div>
  
          <div class="avoir-content">
            <div class="montant-section">
              <span class="label">Montant:</span>
              <span class="montant">{{ formatPrice(avoir.montant) }}</span>
            </div>
            
            <div class="ticket-info">
              <span class="label">Ticket d'origine:</span>
              <span class="ticket-ref">#{{ avoir.ticket_origine.reference }}</span>
            </div>
  
            <div class="motif-section">
              <span class="label">Motif:</span>
              <p class="motif">{{ avoir.motif }}</p>
            </div>
  
            <div v-if="avoir.utilisation" class="utilisation-section">
              <div class="utilisation-header">
                <span class="label">Utilisé sur:</span>
                <span class="ticket-ref">#{{ avoir.utilisation.ticket.reference }}</span>
              </div>
              <div class="utilisation-details">
                <span class="date">{{ formatDate(avoir.utilisation.date) }}</span>
                <span class="montant">-{{ formatPrice(avoir.utilisation.montant) }}</span>
              </div>
            </div>
          </div>
  
          <div class="avoir-footer">
            <button 
              v-if="!avoir.utilisation && !isExpired(avoir)"
              class="btn-primary"
              @click="utiliserAvoir(avoir)"
            >
              <i class="fas fa-check"></i>
              Utiliser
            </button>
            <button 
              class="btn-secondary"
              @click="imprimerAvoir(avoir)"
            >
              <i class="fas fa-print"></i>
              Imprimer
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal d'utilisation d'avoir -->
      <div class="modal" :class="{ 'show': showUtilisationModal }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Utiliser l'avoir #{{ selectedAvoir?.reference }}</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeUtilisationModal"
              ></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Montant à utiliser</label>
                <input 
                  type="number" 
                  v-model.number="montantUtilisation"
                  class="form-control"
                  :max="selectedAvoir?.montant"
                  step="0.01"
                >
                <small class="text-muted">
                  Montant disponible: {{ formatPrice(selectedAvoir?.montant) }}
                </small>
              </div>
  
              <div class="form-group">
                <label>Ticket</label>
                <select v-model="ticketUtilisation" class="form-select">
                  <option value="">Sélectionner un ticket</option>
                  <option 
                    v-for="ticket in ticketsDisponibles"
                    :key="ticket.id"
                    :value="ticket.id"
                  >
                    #{{ ticket.reference }} - {{ formatPrice(ticket.montant) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn-secondary"
                @click="closeUtilisationModal"
              >
                Annuler
              </button>
              <button 
                type="button" 
                class="btn-primary"
                @click="validerUtilisation"
                :disabled="!canValiderUtilisation"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import api from '@/utils/api';
  
  export default {
    name: 'AvoirManager',
  
    setup() {
      const store = useStore();
  
      // État
      const avoirs = ref([]);
      const searchQuery = ref('');
      const filterStatus = ref('');
      const showUtilisationModal = ref(false);
      const selectedAvoir = ref(null);
      const montantUtilisation = ref(0);
      const ticketUtilisation = ref('');
      const ticketsDisponibles = ref([]);
  
      // Computed
      const filteredAvoirs = computed(() => {
        return avoirs.value.filter(avoir => {
          const matchQuery = avoir.reference.toLowerCase()
            .includes(searchQuery.value.toLowerCase());
          const matchStatus = !filterStatus.value ||
            getAvoirStatus(avoir).toLowerCase() === filterStatus.value;
          return matchQuery && matchStatus;
        });
      });
  
      const canValiderUtilisation = computed(() => {
        return montantUtilisation.value > 0 &&
          montantUtilisation.value <= selectedAvoir.value?.montant &&
          ticketUtilisation.value;
      });
  
      // Méthodes
      const loadAvoirs = async () => {
        try {
          const response = await api.get('/avoirs');
          avoirs.value = response.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des avoirs'
          });
        }
      };
  
      const loadTicketsDisponibles = async () => {
        try {
          const response = await api.get('/tickets/disponibles');
          ticketsDisponibles.value = response.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des tickets'
          });
        }
      };
  
      const utiliserAvoir = (avoir) => {
        selectedAvoir.value = avoir;
        montantUtilisation.value = avoir.montant;
        loadTicketsDisponibles();
        showUtilisationModal.value = true;
      };
  
      const closeUtilisationModal = () => {
        showUtilisationModal.value = false;
        selectedAvoir.value = null;
        montantUtilisation.value = 0;
        ticketUtilisation.value = '';
      };
  
      const validerUtilisation = async () => {
        try {
          await api.post(`/avoirs/${selectedAvoir.value.id}/utiliser`, {
            ticket_id: ticketUtilisation.value,
            montant: montantUtilisation.value
          });
  
          await loadAvoirs();
          closeUtilisationModal();
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Avoir utilisé avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'utilisation de l\'avoir'
          });
        }
      };
  
      const imprimerAvoir = async (avoir) => {
        try {
          const response = await api.get(
            `/avoirs/${avoir.id}/print`,
            { responseType: 'blob' }
          );
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `avoir_${avoir.reference}.pdf`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'impression de l\'avoir'
          });
        }
      };
  
      const getAvoirStatus = (avoir) => {
        if (avoir.utilisation) return 'Utilisé';
        if (isExpired(avoir)) return 'Expiré';
        return 'Actif';
      };
  
      const getAvoirStatusClass = (avoir) => {
        const status = getAvoirStatus(avoir);
        return {
          'status-active': status === 'Actif',
          'status-used': status === 'Utilisé',
          'status-expired': status === 'Expiré'
        };
      };
  
      const isExpired = (avoir) => {
        const expirationDate = new Date(avoir.date_emission);
        expirationDate.setMonth(expirationDate.getMonth() + 3); // 3 mois de validité
        return new Date() > expirationDate;
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadAvoirs();
      });
  
      return {
        avoirs,
        searchQuery,
        filterStatus,
        showUtilisationModal,
        selectedAvoir,
        montantUtilisation,
        ticketUtilisation,
        ticketsDisponibles,
        filteredAvoirs,
        canValiderUtilisation,
        utiliserAvoir,
        closeUtilisationModal,
        validerUtilisation,
        imprimerAvoir,
        getAvoirStatus,
        getAvoirStatusClass,
        isExpired,
        formatPrice,
        formatDate
      };
    }
  };
  </script>
  

  
  <style scoped>
  .avoir-manager {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
  }
  
  .search-box {
    position: relative;
  }
  
  .search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }
  
  .search-box input {
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    width: 300px;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .avoirs-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
  }
  
  .avoir-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .avoir-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .avoir-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .avoir-ref {
    font-weight: 500;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }
  
  .avoir-date {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .avoir-content {
    padding: 1rem;
  }
  
  .montant-section {
    margin-bottom: 1rem;
  }
  
  .montant {
    font-size: 1.25rem;
    font-weight: 500;
    color: #ff6600;
  }
  
  .ticket-info {
    margin-bottom: 1rem;
  }
  
  .ticket-ref {
    font-weight: 500;
  }
  
  .motif-section {
    margin-bottom: 1rem;
  }
  
  .motif {
    color: #6c757d;
    margin: 0;
  }
  
  .utilisation-section {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .utilisation-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .utilisation-details {
    display: flex;
    justify-content: space-between;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .avoir-footer {
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  /* Status colors */
  .status-active {
    background-color: #d1e7dd;
    color: #0f5132;
  }
  
  .status-used {
    background-color: #cfe2ff;
    color: #084298;
  }
  
  .status-expired {
    background-color: #f8d7da;
    color: #842029;
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
    max-width: 500px;
    margin: 1rem;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-control,
  .form-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .text-muted {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .avoir-manager {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .filters {
      width: 100%;
      flex-direction: column;
    }
  
    .search-box input {
      width: 100%;
    }
  
    .avoirs-list {
      grid-template-columns: 1fr;
    }
  }
  </style>
  