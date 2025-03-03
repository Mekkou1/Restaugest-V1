<template>
    <div class="transfert-manager">
      <div class="header-section">
        <h2>Transferts entre caisses</h2>
        <button 
          class="btn btn-primary"
          @click="nouveauTransfert"
        >
          <i class="fas fa-exchange-alt"></i>
          Nouveau transfert
        </button>
      </div>
  
      <!-- Liste des transferts -->
      <div class="transferts-grid">
        <!-- Transferts en cours -->
        <div class="transferts-card">
          <div class="card-header">
            <h3>Transferts en cours</h3>
            <span class="badge">{{ transfertsEnCours.length }}</span>
          </div>
          <div class="card-content">
            <div 
              v-if="transfertsEnCours.length === 0"
              class="empty-state"
            >
              <i class="fas fa-inbox"></i>
              <p>Aucun transfert en cours</p>
            </div>
            <div 
              v-else
              class="transferts-list"
            >
              <div 
                v-for="transfert in transfertsEnCours"
                :key="transfert.id"
                class="transfert-item"
              >
                <div class="transfert-header">
                  <div class="transfert-info">
                    <span class="transfert-ref">#{{ transfert.reference }}</span>
                    <span class="transfert-date">{{ formatDateTime(transfert.date_creation) }}</span>
                  </div>
                  <div class="transfert-status">
                    <span 
                      class="status-badge"
                      :class="getStatusClass(transfert.statut)"
                    >
                      {{ transfert.statut }}
                    </span>
                  </div>
                </div>
  
                <div class="transfert-content">
                  <div class="transfert-direction">
                    <div class="caisse-from">
                      <i class="fas fa-cash-register"></i>
                      <span>{{ transfert.caisse_source.nom }}</span>
                    </div>
                    <i class="fas fa-arrow-right"></i>
                    <div class="caisse-to">
                      <i class="fas fa-cash-register"></i>
                      <span>{{ transfert.caisse_dest.nom }}</span>
                    </div>
                  </div>
  
                  <div class="transfert-amount">
                    {{ formatPrice(transfert.montant) }}
                  </div>
                </div>
  
                <div class="transfert-footer">
                  <div class="transfert-user">
                    <i class="fas fa-user"></i>
                    <span>{{ transfert.utilisateur.nom }}</span>
                  </div>
                  <div class="transfert-actions">
                    <button 
                      v-if="peutAnnuler(transfert)"
                      class="btn-icon text-danger"
                      @click="annulerTransfert(transfert)"
                      title="Annuler"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button 
                      v-if="peutValider(transfert)"
                      class="btn-icon text-success"
                      @click="validerTransfert(transfert)"
                      title="Valider"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Historique des transferts -->
        <div class="transferts-card">
          <div class="card-header">
            <h3>Historique</h3>
            <button 
              class="btn-icon"
              @click="exporterHistorique"
            >
              <i class="fas fa-file-export"></i>
            </button>
          </div>
          <div class="card-content">
            <div class="filters">
              <div class="date-range">
                <input 
                  type="date" 
                  v-model="filters.dateDebut"
                  :max="today"
                  class="form-control"
                >
                <span>à</span>
                <input 
                  type="date" 
                  v-model="filters.dateFin"
                  :max="today"
                  class="form-control"
                >
              </div>
              <select v-model="filters.statut" class="form-select">
                <option value="">Tous les statuts</option>
                <option value="VALIDE">Validés</option>
                <option value="ANNULE">Annulés</option>
              </select>
            </div>
  
            <div class="transferts-list">
              <div 
                v-for="transfert in filteredHistorique"
                :key="transfert.id"
                class="transfert-item"
              >
                <div class="transfert-header">
                  <div class="transfert-info">
                    <span class="transfert-ref">#{{ transfert.reference }}</span>
                    <span class="transfert-date">{{ formatDateTime(transfert.date_creation) }}</span>
                  </div>
                  <div class="transfert-status">
                    <span 
                      class="status-badge"
                      :class="getStatusClass(transfert.statut)"
                    >
                      {{ transfert.statut }}
                    </span>
                  </div>
                </div>
  
                <div class="transfert-content">
                  <div class="transfert-direction">
                    <div class="caisse-from">
                      <i class="fas fa-cash-register"></i>
                      <span>{{ transfert.caisse_source.nom }}</span>
                    </div>
                    <i class="fas fa-arrow-right"></i>
                    <div class="caisse-to">
                      <i class="fas fa-cash-register"></i>
                      <span>{{ transfert.caisse_dest.nom }}</span>
                    </div>
                  </div>
  
                  <div class="transfert-amount">
                    {{ formatPrice(transfert.montant) }}
                  </div>
                </div>
  
                <div class="transfert-footer">
                  <div class="transfert-user">
                    <i class="fas fa-user"></i>
                    <span>{{ transfert.utilisateur.nom }}</span>
                  </div>
                  <button 
                    class="btn-link"
                    @click="voirDetails(transfert)"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de nouveau transfert -->
      <div class="modal" :class="{ 'show': showTransfertModal }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nouveau transfert</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeTransfertModal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="creerTransfert">
                <div class="form-group">
                  <label>Caisse source</label>
                  <select 
                    v-model="transfertForm.caisse_source"
                    class="form-select"
                    required
                  >
                    <option 
                      v-for="caisse in caissesDisponibles"
                      :key="caisse.id"
                      :value="caisse.id"
                    >
                      {{ caisse.nom }} ({{ formatPrice(caisse.solde) }})
                    </option>
                  </select>
                </div>
  
                <div class="form-group">
                  <label>Caisse destination</label>
                  <select 
                    v-model="transfertForm.caisse_dest"
                    class="form-select"
                    required
                  >
                    <option 
                      v-for="caisse in caissesDestination"
                      :key="caisse.id"
                      :value="caisse.id"
                    >
                      {{ caisse.nom }}
                    </option>
                  </select>
                </div>
  
                <div class="form-group">
                  <label>Montant</label>
                  <input 
                    type="number" 
                    v-model.number="transfertForm.montant"
                    class="form-control"
                    min="0"
                    :max="montantMaximum"
                    required
                  >
                  <small class="form-text">
                    Maximum: {{ formatPrice(montantMaximum) }}
                  </small>
                </div>
  
                <div class="form-group">
                  <label>Motif</label>
                  <textarea 
                    v-model="transfertForm.motif"
                    class="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeTransfertModal"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                @click="creerTransfert"
                :disabled="!peutCreer"
              >
                Créer le transfert
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
              <h5 class="modal-title">Détails du transfert</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeDetails"
              ></button>
            </div>
            <div class="modal-body" v-if="selectedTransfert">
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Référence:</span>
                  <span>#{{ selectedTransfert.reference }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Date:</span>
                  <span>{{ formatDateTime(selectedTransfert.date_creation) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Statut:</span>
                  <span 
                    class="status-badge"
                    :class="getStatusClass(selectedTransfert.statut)"
                  >
                    {{ selectedTransfert.statut }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Montant:</span>
                  <span>{{ formatPrice(selectedTransfert.montant) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Caisse source:</span>
                  <span>{{ selectedTransfert.caisse_source.nom }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Caisse destination:</span>
                  <span>{{ selectedTransfert.caisse_dest.nom }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Créé par:</span>
                  <span>{{ selectedTransfert.utilisateur.nom }}</span>
                </div>
              </div>
  
              <div class="detail-motif">
                <span class="label">Motif:</span>
                <p>{{ selectedTransfert.motif }}</p>
              </div>
  
              <div v-if="selectedTransfert.historique?.length" class="detail-history">
                <h6>Historique</h6>
                <div 
                  v-for="(event, index) in selectedTransfert.historique"
                  :key="index"
                  class="history-item"
                >
                  <div class="history-time">
                    {{ formatDateTime(event.date) }}
                  </div>
                  <div class="history-content">
                    <strong>{{ event.utilisateur }}:</strong>
                    {{ event.action }}
                  </div>
                </div>
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
    name: 'TransfertManager',
  
    setup() {
      const store = useStore();
  
      // État
      const transfertsEnCours = ref([]);
      const historique = ref([]);
      const caisses = ref([]);
      const showTransfertModal = ref(false);
      const showDetails = ref(false);
      const selectedTransfert = ref(null);
  
      const transfertForm = ref({
        caisse_source: null,
        caisse_dest: null,
        montant: 0,
        motif: ''
      });
  
      const filters = ref({
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: new Date().toISOString().split('T')[0],
        statut: ''
      });
  
      // Computed
      const today = computed(() => new Date().toISOString().split('T')[0]);
  
      const caissesDisponibles = computed(() => {
        return caisses.value.filter(c => c.solde > 0);
      });
  
      const caissesDestination = computed(() => {
        if (!transfertForm.value.caisse_source) return [];
        return caisses.value.filter(c => 
          c.id !== transfertForm.value.caisse_source
        );
      });
  
      const montantMaximum = computed(() => {
        if (!transfertForm.value.caisse_source) return 0;
        const caisse = caisses.value.find(
          c => c.id === transfertForm.value.caisse_source
        );
        return caisse ? caisse.solde : 0;
      });
  
      const peutCreer = computed(() => {
        return transfertForm.value.caisse_source && 
          transfertForm.value.caisse_dest &&
          transfertForm.value.montant > 0 &&
          transfertForm.value.montant <= montantMaximum.value &&
          transfertForm.value.motif.trim();
      });
  
      const filteredHistorique = computed(() => {
        return historique.value.filter(t => {
          const matchDate = new Date(t.date_creation) >= new Date(filters.value.dateDebut) &&
                           new Date(t.date_creation) <= new Date(filters.value.dateFin);
          const matchStatut = !filters.value.statut || t.statut === filters.value.statut;
          return matchDate && matchStatut;
        });
      });
  
      // Méthodes
      const loadData = async () => {
        try {
          const [transfertsRes, historiqueRes, caissesRes] = await Promise.all([
            api.get('/transferts/en-cours'),
            api.get('/transferts/historique'),
            api.get('/caisses')
          ]);
  
          transfertsEnCours.value = transfertsRes.data;
          historique.value = historiqueRes.data;
          caisses.value = caissesRes.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des données'
          });
        }
      };
  
      const nouveauTransfert = () => {
        transfertForm.value = {
          caisse_source: null,
          caisse_dest: null,
          montant: 0,
          motif: ''
        };
        showTransfertModal.value = true;
      };
  
      const creerTransfert = async () => {
        try {
          await api.post('/transferts', transfertForm.value);
          await loadData();
          closeTransfertModal();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Transfert créé avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la création du transfert'
          });
        }
      };
  
      const closeTransfertModal = () => {
        showTransfertModal.value = false;
        transfertForm.value = {
          caisse_source: null,
          caisse_dest: null,
          montant: 0,
          motif: ''
        };
      };
  
      const validerTransfert = async (transfert) => {
        try {
          await api.put(`/transferts/${transfert.id}/valider`);
          await loadData();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Transfert validé avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la validation'
          });
        }
      };
  
      const annulerTransfert = async (transfert) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler ce transfert ?')) return;
  
        try {
          await api.put(`/transferts/${transfert.id}/annuler`);
          await loadData();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Transfert annulé avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'annulation'
          });
        }
      };
  
      const voirDetails = (transfert) => {
        selectedTransfert.value = transfert;
        showDetails.value = true;
      };
  
      const closeDetails = () => {
        showDetails.value = false;
        selectedTransfert.value = null;
      };
  
      const exporterHistorique = async () => {
        try {
          const response = await api.get('/transferts/export', {
            params: filters.value,
            responseType: 'blob'
          });
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `transferts_${filters.value.dateDebut}_${filters.value.dateFin}.xlsx`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'export'
          });
        }
      };
  
      const peutValider = (transfert) => {
        return transfert.statut === 'EN_ATTENTE' && 
          transfert.caisse_dest.utilisateur_id === store.state.user.id;
      };
  
      const peutAnnuler = (transfert) => {
        return transfert.statut === 'EN_ATTENTE' && (
          transfert.caisse_source.utilisateur_id === store.state.user.id ||
          transfert.caisse_dest.utilisateur_id === store.state.user.id
        );
      };
  
      const getStatusClass = (statut) => {
        const classes = {
          'EN_ATTENTE': 'status-pending',
          'VALIDE': 'status-success',
          'ANNULE': 'status-danger'
        };
        return classes[statut] || '';
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
  
      // Lifecycle hooks
      onMounted(() => {
        loadData();
      });
  
      return {
        transfertsEnCours,
        historique,
        caisses,
        showTransfertModal,
        showDetails,
        selectedTransfert,
        transfertForm,
        filters,
        today,
        caissesDisponibles,
        caissesDestination,
        montantMaximum,
        peutCreer,
        filteredHistorique,
        nouveauTransfert,
        creerTransfert,
        closeTransfertModal,
        validerTransfert,
        annulerTransfert,
        voirDetails,
        closeDetails,
        exporterHistorique,
        peutValider,
        peutAnnuler,
        getStatusClass,
        formatPrice,
        formatDateTime
      };
    }
  };
  </script>
  
  <style scoped>
  .transfert-manager {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .transferts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .transferts-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    background: #f8f9fa;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }
  
  .empty-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .transferts-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .transfert-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .transfert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .transfert-info {
    display: flex;
    gap: 1rem;
  }
  
  .transfert-ref {
    font-weight: 500;
  }
  
  .transfert-date {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }
  
  .status-pending {
    background: #fff3cd;
    color: #664d03;
  }
  
  .status-success {
    background: #d1e7dd;
    color: #0f5132;
  }
  
  .status-danger {
    background: #f8d7da;
    color: #842029;
  }
  
  .transfert-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .transfert-direction {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .caisse-from,
  .caisse-to {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .transfert-amount {
    font-weight: 500;
    color: #ff6600;
  }
  
  .transfert-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .transfert-user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .transfert-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .date-range {
    display: flex;
    align-items: center;
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
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  
  .form-text {
    display: block;
    margin-top: 0.25rem;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .detail-item .label {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .detail-motif {
    margin-bottom: 1.5rem;
  }
  
  .detail-motif .label {
    display: block;
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .detail-history {
    border-top: 1px solid #dee2e6;
    padding-top: 1.5rem;
  }
  
  .history-item {
    margin-bottom: 1rem;
  }
  
  .history-time {
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-primary {
    background: #ff6600;
    color: white;
  }
  
  .btn-secondary {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
  }
  
  .btn-icon {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
  }
  
  .btn-link {
    padding: 0;
    background: none;
    border: none;
    color: #ff6600;
    cursor: pointer;
  }
  
  .text-success {
    color: #28a745;
  }
  
  .text-danger {
    color: #dc3545;
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
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .transfert-manager {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .header-section .btn {
      width: 100%;
    }
  
    .transferts-grid {
      grid-template-columns: 1fr;
    }
  
    .filters {
      flex-direction: column;
    }
  
    .date-range {
      width: 100%;
    }
  
    .form-select {
      width: 100%;
    }
  
    .transfert-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  
    .transfert-direction {
      flex-direction: column;
    }
  }
  </style>
  