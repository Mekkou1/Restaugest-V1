<template>
    <div class="fonds-manager">
      <div class="header-section">
        <h2>Gestion des fonds de caisse</h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary"
            @click="ajouterSortie"
          >
            <i class="fas fa-minus"></i>
            Sortie de fonds
          </button>
          <button 
            class="btn btn-primary"
            @click="ajouterEntree"
          >
            <i class="fas fa-plus"></i>
            Entrée de fonds
          </button>
        </div>
      </div>
  
      <!-- État des fonds -->
      <div class="fonds-grid">
        <!-- Solde actuel -->
        <div class="fonds-card">
          <div class="card-header">
            <h3>Solde actuel</h3>
            <div class="solde-status">
              <i 
                :class="getSoldeStatusIcon"
                :title="getSoldeStatusText"
              ></i>
            </div>
          </div>
          <div class="card-content">
            <div class="solde-amount">
              {{ formatPrice(solde) }}
            </div>
            <div class="solde-details">
              <div class="detail-row">
                <span>Fonds initial:</span>
                <span>{{ formatPrice(fondsInitial) }}</span>
              </div>
              <div class="detail-row">
                <span>Entrées:</span>
                <span class="text-success">+{{ formatPrice(totalEntrees) }}</span>
              </div>
              <div class="detail-row">
                <span>Sorties:</span>
                <span class="text-danger">-{{ formatPrice(totalSorties) }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Mouvements du jour -->
        <div class="fonds-card">
          <div class="card-header">
            <h3>Mouvements du jour</h3>
            <button 
              class="btn-icon"
              @click="exporterMouvements"
            >
              <i class="fas fa-file-export"></i>
            </button>
          </div>
          <div class="card-content">
            <div class="mouvements-list">
              <div 
                v-for="mouvement in mouvements"
                :key="mouvement.id"
                class="mouvement-item"
              >
                <div class="mouvement-info">
                  <div class="mouvement-type">
                    <i 
                      :class="getMouvementIcon(mouvement.type)"
                      :title="mouvement.type"
                    ></i>
                    <span>{{ mouvement.motif }}</span>
                  </div>
                  <div class="mouvement-details">
                    <span>{{ formatTime(mouvement.date) }}</span>
                    <span>{{ mouvement.utilisateur }}</span>
                  </div>
                </div>
                <div 
                  class="mouvement-montant"
                  :class="getMouvementClass(mouvement.type)"
                >
                  {{ getMouvementPrefix(mouvement.type) }}{{ formatPrice(mouvement.montant) }}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Seuils et alertes -->
        <div class="fonds-card">
          <div class="card-header">
            <h3>Seuils et alertes</h3>
          </div>
          <div class="card-content">
            <div class="seuils-config">
              <div class="seuil-item">
                <div class="seuil-info">
                  <span>Seuil minimum</span>
                  <small>Alerte si le solde est inférieur</small>
                </div>
                <input 
                  type="number" 
                  v-model.number="seuils.minimum"
                  class="form-control"
                  min="0"
                  @change="sauvegarderSeuils"
                >
              </div>
  
              <div class="seuil-item">
                <div class="seuil-info">
                  <span>Seuil maximum</span>
                  <small>Alerte si le solde est supérieur</small>
                </div>
                <input 
                  type="number" 
                  v-model.number="seuils.maximum"
                  class="form-control"
                  min="0"
                  @change="sauvegarderSeuils"
                >
              </div>
            </div>
  
            <div 
              v-if="alertes.length > 0"
              class="alertes-list"
            >
              <div 
                v-for="alerte in alertes"
                :key="alerte.id"
                class="alerte-item"
                :class="getAlerteClass(alerte.type)"
              >
                <i :class="getAlerteIcon(alerte.type)"></i>
                <span>{{ alerte.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal d'entrée de fonds -->
      <div class="modal" :class="{ 'show': showEntreeModal }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Entrée de fonds</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeEntreeModal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="confirmerEntree">
                <div class="form-group">
                  <label>Montant</label>
                  <input 
                    type="number" 
                    v-model.number="entreeForm.montant"
                    class="form-control"
                    min="0"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Motif</label>
                  <select v-model="entreeForm.motif" class="form-select" required>
                    <option value="APPOINT">Appoint de caisse</option>
                    <option value="DEPOT">Dépôt</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
  
                <div 
                  v-if="entreeForm.motif === 'AUTRE'"
                  class="form-group"
                >
                  <label>Précision</label>
                  <input 
                    type="text" 
                    v-model="entreeForm.precision"
                    class="form-control"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Commentaire</label>
                  <textarea 
                    v-model="entreeForm.commentaire"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeEntreeModal"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                @click="confirmerEntree"
                :disabled="!canConfirmEntree"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de sortie de fonds -->
      <div class="modal" :class="{ 'show': showSortieModal }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Sortie de fonds</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeSortieModal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="confirmerSortie">
                <div class="form-group">
                  <label>Montant</label>
                  <input 
                    type="number" 
                    v-model.number="sortieForm.montant"
                    class="form-control"
                    min="0"
                    :max="solde"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Motif</label>
                  <select v-model="sortieForm.motif" class="form-select" required>
                    <option value="RETRAIT">Retrait</option>
                    <option value="DEPENSE">Dépense</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
  
                <div 
                  v-if="sortieForm.motif === 'AUTRE'"
                  class="form-group"
                >
                  <label>Précision</label>
                  <input 
                    type="text" 
                    v-model="sortieForm.precision"
                    class="form-control"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Commentaire</label>
                  <textarea 
                    v-model="sortieForm.commentaire"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
  
                <div 
                  v-if="sortieForm.montant > solde"
                  class="alert alert-danger"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                  Le montant dépasse le solde disponible
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeSortieModal"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                @click="confirmerSortie"
                :disabled="!canConfirmSortie"
              >
                Confirmer
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
    name: 'FondsManager',
  
    setup() {
      const store = useStore();
  
      // État
      const solde = ref(0);
      const fondsInitial = ref(0);
      const mouvements = ref([]);
      const alertes = ref([]);
      const seuils = ref({
        minimum: 0,
        maximum: 0
      });
  
      const showEntreeModal = ref(false);
      const showSortieModal = ref(false);
  
      const entreeForm = ref({
        montant: 0,
        motif: 'APPOINT',
        precision: '',
        commentaire: ''
      });
  
      const sortieForm = ref({
        montant: 0,
        motif: 'RETRAIT',
        precision: '',
        commentaire: ''
      });
  
      // Computed
      const totalEntrees = computed(() => {
        return mouvements.value
          .filter(m => m.type === 'ENTREE')
          .reduce((sum, m) => sum + m.montant, 0);
      });
  
      const totalSorties = computed(() => {
        return mouvements.value
          .filter(m => m.type === 'SORTIE')
          .reduce((sum, m) => sum + m.montant, 0);
      });
  
      const getSoldeStatusIcon = computed(() => {
        if (solde.value < seuils.value.minimum) {
          return 'fas fa-exclamation-circle text-danger';
        }
        if (solde.value > seuils.value.maximum) {
          return 'fas fa-exclamation-circle text-warning';
        }
        return 'fas fa-check-circle text-success';
      });
  
      const getSoldeStatusText = computed(() => {
        if (solde.value < seuils.value.minimum) {
          return 'Solde insuffisant';
        }
        if (solde.value > seuils.value.maximum) {
          return 'Solde trop élevé';
        }
        return 'Solde normal';
      });
  
      const canConfirmEntree = computed(() => {
        return entreeForm.value.montant > 0 && (
          entreeForm.value.motif !== 'AUTRE' || 
          entreeForm.value.precision.trim()
        );
      });
  
      const canConfirmSortie = computed(() => {
        return sortieForm.value.montant > 0 && 
          sortieForm.value.montant <= solde.value && (
            sortieForm.value.motif !== 'AUTRE' || 
            sortieForm.value.precision.trim()
          );
      });
  
      // Méthodes
      const loadData = async () => {
        try {
          const [fondsRes, mouvementsRes, seuilsRes] = await Promise.all([
            api.get('/caisse/fonds'),
            api.get('/caisse/mouvements'),
            api.get('/caisse/seuils')
          ]);
  
          solde.value = fondsRes.data.solde;
          fondsInitial.value = fondsRes.data.initial;
          mouvements.value = mouvementsRes.data;
          seuils.value = seuilsRes.data;
  
          checkAlertes();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des données'
          });
        }
      };
  
      const checkAlertes = () => {
        alertes.value = [];
  
        if (solde.value < seuils.value.minimum) {
          alertes.value.push({
            type: 'DANGER',
            message: `Solde insuffisant (minimum: ${formatPrice(seuils.value.minimum)})`
          });
        }
  
        if (solde.value > seuils.value.maximum) {
          alertes.value.push({
            type: 'WARNING',
            message: `Solde trop élevé (maximum: ${formatPrice(seuils.value.maximum)})`
          });
        }
      };
  
      const ajouterEntree = () => {
        entreeForm.value = {
          montant: 0,
          motif: 'APPOINT',
          precision: '',
          commentaire: ''
        };
        showEntreeModal.value = true;
      };
  
      const ajouterSortie = () => {
        sortieForm.value = {
          montant: 0,
          motif: 'RETRAIT',
          precision: '',
          commentaire: ''
        };
        showSortieModal.value = true;
      };
  
      const confirmerEntree = async () => {
        try {
          await api.post('/caisse/entree', {
            montant: entreeForm.value.montant,
            motif: entreeForm.value.motif,
            precision: entreeForm.value.precision,
            commentaire: entreeForm.value.commentaire
          });
  
          await loadData();
          closeEntreeModal();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Entrée de fonds enregistrée'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      };
  
      const confirmerSortie = async () => {
        try {
          await api.post('/caisse/sortie', {
            montant: sortieForm.value.montant,
            motif: sortieForm.value.motif,
            precision: sortieForm.value.precision,
            commentaire: sortieForm.value.commentaire
          });
  
          await loadData();
          closeSortieModal();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Sortie de fonds enregistrée'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      };
  
      const closeEntreeModal = () => {
        showEntreeModal.value = false;
        entreeForm.value = {
          montant: 0,
          motif: 'APPOINT',
          precision: '',
          commentaire: ''
        };
      };
  
      const closeSortieModal = () => {
        showSortieModal.value = false;
        sortieForm.value = {
          montant: 0,
          motif: 'RETRAIT',
          precision: '',
          commentaire: ''
        };
      };
  
      const sauvegarderSeuils = async () => {
        try {
          await api.put('/caisse/seuils', seuils.value);
          checkAlertes();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Seuils enregistrés'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      };
  
      const exporterMouvements = async () => {
        try {
          const response = await api.get('/caisse/mouvements/export', {
            responseType: 'blob'
          });
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `mouvements_${new Date().toISOString().split('T')[0]}.xlsx`
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
  
      const getMouvementIcon = (type) => {
        return type === 'ENTREE' ? 
          'fas fa-arrow-circle-up' : 
          'fas fa-arrow-circle-down';
      };
  
      const getMouvementClass = (type) => {
        return type === 'ENTREE' ? 'text-success' : 'text-danger';
      };
  
      const getMouvementPrefix = (type) => {
        return type === 'ENTREE' ? '+' : '-';
      };
  
      const getAlerteClass = (type) => {
        return type === 'DANGER' ? 'alerte-danger' : 'alerte-warning';
      };
  
      const getAlerteIcon = (type) => {
        return type === 'DANGER' ? 
          'fas fa-exclamation-triangle' : 
          'fas fa-exclamation-circle';
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadData();
      });
  
      return {
        solde,
        fondsInitial,
        mouvements,
        alertes,
        seuils,
        showEntreeModal,
        showSortieModal,
        entreeForm,
        sortieForm,
        totalEntrees,
        totalSorties,
        getSoldeStatusIcon,
        getSoldeStatusText,
        canConfirmEntree,
        canConfirmSortie,
        ajouterEntree,
        ajouterSortie,
        confirmerEntree,
        confirmerSortie,
        closeEntreeModal,
        closeSortieModal,
        sauvegarderSeuils,
        exporterMouvements,
        getMouvementIcon,
        getMouvementClass,
        getMouvementPrefix,
        getAlerteClass,
        getAlerteIcon,
        formatPrice,
        formatTime
      };
    }
  };
  </script>
  
  <style scoped>
  .fonds-manager {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
  }
  
  .fonds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .fonds-card {
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
  
  .card-content {
    padding: 1.5rem;
  }
  
  .solde-amount {
    font-size: 2rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .solde-details {
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .mouvements-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .mouvement-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #dee2e6;
  }
  
  .mouvement-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .mouvement-info {
    flex: 1;
  }
  
  .mouvement-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .mouvement-details {
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .mouvement-montant {
    font-weight: 500;
  }
  
  .seuils-config {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .seuil-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  
  .seuil-info {
    flex: 1;
  }
  
  .seuil-info span {
    display: block;
    font-weight: 500;
  }
  
  .seuil-info small {
    color: #6c757d;
  }
  
  .seuil-item .form-control {
    width: 150px;
  }
  
  .alertes-list {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #dee2e6;
  }
  
  .alerte-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }
  
  .alerte-danger {
    background: #f8d7da;
    color: #842029;
  }
  
  .alerte-warning {
    background: #fff3cd;
    color: #664d03;
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
  
  .text-success {
    color: #28a745;
  }
  
  .text-danger {
    color: #dc3545;
  }
  
  .text-warning {
    color: #ffc107;
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
  
  .alert {
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .alert-danger {
    background: #f8d7da;
    color: #842029;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .fonds-manager {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .header-actions {
      width: 100%;
    }
  
    .header-actions .btn {
      flex: 1;
    }
  
    .fonds-grid {
      grid-template-columns: 1fr;
    }
  
    .seuil-item {
      flex-direction: column;
      align-items: stretch;
    }
  
    .seuil-item .form-control {
      width: 100%;
    }
  }
  </style>
  