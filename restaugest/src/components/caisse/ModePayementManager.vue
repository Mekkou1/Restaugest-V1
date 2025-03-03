<template>
    <div class="mode-paiement-manager">
      <div class="header-section">
        <h2>Modes de paiement</h2>
        <button 
          class="btn btn-primary"
          @click="ajouterMode"
        >
          <i class="fas fa-plus"></i>
          Nouveau mode de paiement
        </button>
      </div>
  
      <!-- Liste des modes de paiement -->
      <div class="modes-grid">
        <!-- Mode espèces (toujours présent et non supprimable) -->
        <div class="mode-card mode-default">
          <div class="mode-header">
            <div class="mode-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="mode-info">
              <h3>Espèces</h3>
              <span class="mode-type">Mode par défaut</span>
            </div>
            <div class="mode-actions">
              <button 
                class="btn-icon"
                @click="configurerMode(modeEspeces)"
              >
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
  
          <div class="mode-content">
            <div class="config-item">
              <span class="label">Rendu monnaie:</span>
              <span class="value">Autorisé</span>
            </div>
            <div class="config-item">
              <span class="label">Montant minimum:</span>
              <span class="value">{{ formatPrice(modeEspeces.montant_min) }}</span>
            </div>
            <div class="config-item">
              <span class="label">Commission:</span>
              <span class="value">{{ modeEspeces.commission }}%</span>
            </div>
          </div>
  
          <div class="mode-footer">
            <label class="toggle-switch">
              <input 
                type="checkbox"
                v-model="modeEspeces.actif"
                @change="toggleMode(modeEspeces)"
              >
              <span class="slider"></span>
              <span class="toggle-label">
                {{ modeEspeces.actif ? 'Activé' : 'Désactivé' }}
              </span>
            </label>
          </div>
        </div>
  
        <!-- Autres modes de paiement -->
        <div 
          v-for="mode in modesPaiement"
          :key="mode.id"
          class="mode-card"
        >
          <div class="mode-header">
            <div class="mode-icon">
              <i :class="getPaymentIcon(mode.type)"></i>
            </div>
            <div class="mode-info">
              <h3>{{ mode.nom }}</h3>
              <span class="mode-type">{{ mode.type }}</span>
            </div>
            <div class="mode-actions">
              <button 
                class="btn-icon"
                @click="configurerMode(mode)"
              >
                <i class="fas fa-cog"></i>
              </button>
              <button 
                class="btn-icon text-danger"
                @click="supprimerMode(mode)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
  
          <div class="mode-content">
            <div class="config-item">
              <span class="label">Terminal:</span>
              <span class="value">{{ mode.terminal || 'Non requis' }}</span>
            </div>
            <div class="config-item">
              <span class="label">Montant minimum:</span>
              <span class="value">{{ formatPrice(mode.montant_min) }}</span>
            </div>
            <div class="config-item">
              <span class="label">Commission:</span>
              <span class="value">{{ mode.commission }}%</span>
            </div>
            <div class="config-item">
              <span class="label">Délai de règlement:</span>
              <span class="value">{{ mode.delai_reglement }} jours</span>
            </div>
          </div>
  
          <div class="mode-footer">
            <label class="toggle-switch">
              <input 
                type="checkbox"
                v-model="mode.actif"
                @change="toggleMode(mode)"
              >
              <span class="slider"></span>
              <span class="toggle-label">
                {{ mode.actif ? 'Activé' : 'Désactivé' }}
              </span>
            </label>
          </div>
        </div>
      </div>
  
      <!-- Modal de configuration -->
      <div class="modal" :class="{ 'show': showConfig }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingMode ? 'Modifier' : 'Nouveau' }} mode de paiement
              </h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeConfig"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveConfig">
                <div class="form-group">
                  <label>Nom</label>
                  <input 
                    type="text" 
                    v-model="modeForm.nom"
                    class="form-control"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Type</label>
                  <select 
                    v-model="modeForm.type"
                    class="form-select"
                    required
                  >
                    <option value="CARTE">Carte bancaire</option>
                    <option value="MOBILE">Mobile money</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="VIREMENT">Virement</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
  
                <div class="form-group">
                  <label>Terminal (optionnel)</label>
                  <input 
                    type="text" 
                    v-model="modeForm.terminal"
                    class="form-control"
                    placeholder="Numéro ou référence du terminal"
                  >
                </div>
  
                <div class="form-row">
                  <div class="form-group">
                    <label>Montant minimum</label>
                    <input 
                      type="number" 
                      v-model.number="modeForm.montant_min"
                      class="form-control"
                      min="0"
                      required
                    >
                  </div>
  
                  <div class="form-group">
                    <label>Commission (%)</label>
                    <input 
                      type="number" 
                      v-model.number="modeForm.commission"
                      class="form-control"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    >
                  </div>
                </div>
  
                <div class="form-group">
                  <label>Délai de règlement (jours)</label>
                  <input 
                    type="number" 
                    v-model.number="modeForm.delai_reglement"
                    class="form-control"
                    min="0"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Instructions de paiement</label>
                  <textarea 
                    v-model="modeForm.instructions"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
  
                <div class="form-checks">
                  <div class="form-check">
                    <input 
                      type="checkbox"
                      v-model="modeForm.demander_reference"
                      class="form-check-input"
                      id="ref"
                    >
                    <label class="form-check-label" for="ref">
                      Demander une référence de transaction
                    </label>
                  </div>
  
                  <div class="form-check">
                    <input 
                      type="checkbox"
                      v-model="modeForm.actif"
                      class="form-check-input"
                      id="actif"
                    >
                    <label class="form-check-label" for="actif">
                      Mode de paiement actif
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeConfig"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                @click="saveConfig"
              >
                {{ editingMode ? 'Enregistrer' : 'Ajouter' }}
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de confirmation de suppression -->
      <div class="modal" :class="{ 'show': showDelete }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmer la suppression</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="showDelete = false"
              ></button>
            </div>
            <div class="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer le mode de paiement 
                <strong>{{ modeToDelete?.nom }}</strong> ?
              </p>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Cette action est irréversible et pourrait affecter les transactions existantes.
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="showDelete = false"
              >
                Annuler
              </button>
              <button 
                type="button" 
                class="btn btn-danger"
                @click="confirmDelete"
              >
                Supprimer
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
    name: 'ModePaiementManager',
  
    setup() {
      const store = useStore();
  
      // État
      const modesPaiement = ref([]);
      const modeEspeces = ref({
        id: 1,
        nom: 'Espèces',
        type: 'ESPECES',
        montant_min: 0,
        commission: 0,
        actif: true,
        default: true
      });
      const showConfig = ref(false);
      const showDelete = ref(false);
      const editingMode = ref(null);
      const modeToDelete = ref(null);
      const modeForm = ref({
        nom: '',
        type: 'CARTE',
        terminal: '',
        montant_min: 0,
        commission: 0,
        delai_reglement: 0,
        instructions: '',
        demander_reference: false,
        actif: true
      });
  
      // Méthodes
      const loadModes = async () => {
        try {
          const response = await api.get('/modes-paiement');
          modesPaiement.value = response.data.filter(mode => !mode.default);
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des modes de paiement'
          });
        }
      };
  
      const ajouterMode = () => {
        editingMode.value = null;
        modeForm.value = {
          nom: '',
          type: 'CARTE',
          terminal: '',
          montant_min: 0,
          commission: 0,
          delai_reglement: 0,
          instructions: '',
          demander_reference: false,
          actif: true
        };
        showConfig.value = true;
      };
  
      const configurerMode = (mode) => {
        editingMode.value = mode;
        modeForm.value = { ...mode };
        showConfig.value = true;
      };
  
      const closeConfig = () => {
        showConfig.value = false;
        editingMode.value = null;
        modeForm.value = {
          nom: '',
          type: 'CARTE',
          terminal: '',
          montant_min: 0,
          commission: 0,
          delai_reglement: 0,
          instructions: '',
          demander_reference: false,
          actif: true
        };
      };
  
      const saveConfig = async () => {
        try {
          if (editingMode.value) {
            await api.put(`/modes-paiement/${editingMode.value.id}`, modeForm.value);
          } else {
            await api.post('/modes-paiement', modeForm.value);
          }
  
          await loadModes();
          closeConfig();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: `Mode de paiement ${editingMode.value ? 'modifié' : 'ajouté'} avec succès`
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      };
  
      const supprimerMode = (mode) => {
        modeToDelete.value = mode;
        showDelete.value = true;
      };
  
      const confirmDelete = async () => {
        try {
          await api.delete(`/modes-paiement/${modeToDelete.value.id}`);
          await loadModes();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Mode de paiement supprimé avec succès'
          });
  
          showDelete.value = false;
          modeToDelete.value = null;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la suppression'
          });
        }
      };
  
      const toggleMode = async (mode) => {
        try {
          await api.put(`/modes-paiement/${mode.id}/toggle`, {
            actif: mode.actif
          });
          
          store.dispatch('showNotification', {
            type: 'success',
            message: `Mode de paiement ${mode.actif ? 'activé' : 'désactivé'}`
          });
        } catch (error) {
          mode.actif = !mode.actif; // Revert change
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du changement de statut'
          });
        }
      };
  
      const getPaymentIcon = (type) => {
        const icons = {
          'CARTE': 'fas fa-credit-card',
          'MOBILE': 'fas fa-mobile-alt',
          'CHEQUE': 'fas fa-money-check-alt',
          'VIREMENT': 'fas fa-university',
          'AUTRE': 'fas fa-wallet'
        };
        return icons[type] || 'fas fa-money-bill';
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadModes();
      });
  
      return {
        modesPaiement,
        modeEspeces,
        showConfig,
        showDelete,
        editingMode,
        modeToDelete,
        modeForm,
        ajouterMode,
        configurerMode,
        closeConfig,
        saveConfig,
        supprimerMode,
        confirmDelete,
        toggleMode,
        getPaymentIcon,
        formatPrice
      };
    }
  };
  </script>
  
  <style scoped>
  .mode-paiement-manager {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .modes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .mode-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .mode-card.mode-default {
    border: 2px solid #ff6600;
  }
  
  .mode-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .mode-icon {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #ff6600;
  }
  
  .mode-info {
    flex: 1;
  }
  
  .mode-info h3 {
    margin: 0 0 0.25rem;
  }
  
  .mode-type {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .mode-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .mode-content {
    padding: 1.5rem;
  }
  
  .config-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .config-item .label {
    color: #6c757d;
  }
  
  .mode-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .toggle-switch input {
    display: none;
  }
  
  .slider {
    position: relative;
    width: 48px;
    height: 24px;
    background: #dee2e6;
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .slider:before {
    content: '';
    position: absolute;
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  input:checked + .slider {
    background: #28a745;
  }
  
  input:checked + .slider:before {
    transform: translateX(24px);
  }
  
  .toggle-label {
    font-size: 0.875rem;
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
  
  .btn-primary {
    background: #ff6600;
    color: white;
  }
  
  .btn-secondary {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-icon {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
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
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .form-checks {
    margin-top: 1rem;
  }
  
  .form-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .alert {
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .alert-warning {
    background: #fff3cd;
    color: #664d03;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .mode-paiement-manager {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .header-section .btn {
      width: 100%;
    }
  
    .modes-grid {
      grid-template-columns: 1fr;
    }
  
    .mode-header {
      flex-wrap: wrap;
    }
  
    .mode-actions {
      width: 100%;
      margin-top: 1rem;
      justify-content: flex-end;
    }
  
    .form-row {
      grid-template-columns: 1fr;
    }
  }
  </style>
  