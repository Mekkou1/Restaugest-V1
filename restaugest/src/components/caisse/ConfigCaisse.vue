<template>
    <div class="config-caisse">
      <div class="header-section">
        <h2>Configuration des caisses</h2>
        <button 
          class="btn btn-primary"
          @click="sauvegarderConfig"
          :disabled="!hasChanges"
        >
          <i class="fas fa-save"></i>
          Enregistrer les modifications
        </button>
      </div>
  
      <!-- Sections de configuration -->
      <div class="config-sections">
        <!-- Paramètres généraux -->
        <div class="config-card">
          <div class="card-header">
            <h3>Paramètres généraux</h3>
            <button 
              class="btn-icon"
              @click="resetSection('general')"
              :disabled="!sectionHasChanges('general')"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label>Devise principale</label>
              <select v-model="config.general.devise_principale" class="form-select">
                <option v-for="devise in devises" :key="devise.code" :value="devise.code">
                  {{ devise.nom }} ({{ devise.code }})
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Format des tickets</label>
              <select v-model="config.general.format_ticket" class="form-select">
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="THERMAL">Thermique 80mm</option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Délai d'expiration des avoirs (jours)</label>
              <input 
                type="number" 
                v-model.number="config.general.expiration_avoirs"
                class="form-control"
                min="1"
              >
            </div>
  
            <div class="form-check">
              <input 
                type="checkbox"
                v-model="config.general.impression_automatique"
                class="form-check-input"
                id="autoprint"
              >
              <label class="form-check-label" for="autoprint">
                Impression automatique des tickets
              </label>
            </div>
          </div>
        </div>
  
        <!-- Règles de remise -->
        <div class="config-card">
          <div class="card-header">
            <h3>Règles de remise</h3>
            <button 
              class="btn-icon"
              @click="resetSection('remises')"
              :disabled="!sectionHasChanges('remises')"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label>Remise maximale autorisée (%)</label>
              <input 
                type="number" 
                v-model.number="config.remises.max_remise"
                class="form-control"
                min="0"
                max="100"
              >
            </div>
  
            <div class="form-group">
              <label>Remises prédéfinies (%)</label>
              <div class="remises-predefinies">
                <div 
                  v-for="(remise, index) in config.remises.remises_predefinies"
                  :key="index"
                  class="remise-item"
                >
                  <input 
                    type="number" 
                    v-model.number="config.remises.remises_predefinies[index]"
                    class="form-control"
                    min="0"
                    max="100"
                  >
                  <button 
                    class="btn-icon text-danger"
                    @click="supprimerRemise(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button 
                  class="btn btn-outline-secondary"
                  @click="ajouterRemise"
                >
                  <i class="fas fa-plus"></i>
                  Ajouter une remise
                </button>
              </div>
            </div>
  
            <div class="form-check">
              <input 
                type="checkbox"
                v-model="config.remises.autorisation_requise"
                class="form-check-input"
                id="remise-auth"
              >
              <label class="form-check-label" for="remise-auth">
                Autorisation requise pour les remises
              </label>
            </div>
          </div>
        </div>
  
        <!-- Modes de paiement -->
        <div class="config-card">
          <div class="card-header">
            <h3>Modes de paiement</h3>
            <button 
              class="btn-icon"
              @click="resetSection('paiements')"
              :disabled="!sectionHasChanges('paiements')"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
          <div class="card-content">
            <div 
              v-for="mode in config.paiements.modes"
              :key="mode.id"
              class="mode-paiement"
            >
              <div class="mode-header">
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="mode.actif"
                    class="form-check-input"
                  >
                  <label class="form-check-label">{{ mode.nom }}</label>
                </div>
                <button 
                  class="btn-icon"
                  @click="configurerMode(mode)"
                >
                  <i class="fas fa-cog"></i>
                </button>
              </div>
              <div class="mode-options" v-if="mode.actif">
                <div class="form-group">
                  <label>Commission (%)</label>
                  <input 
                    type="number" 
                    v-model.number="mode.commission"
                    class="form-control"
                    min="0"
                    step="0.01"
                  >
                </div>
                <div class="form-group">
                  <label>Montant minimum</label>
                  <input 
                    type="number" 
                    v-model.number="mode.montant_min"
                    class="form-control"
                    min="0"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Alertes et notifications -->
        <div class="config-card">
          <div class="card-header">
            <h3>Alertes et notifications</h3>
            <button 
              class="btn-icon"
              @click="resetSection('alertes')"
              :disabled="!sectionHasChanges('alertes')"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label>Seuil d'alerte pour écart de caisse</label>
              <input 
                type="number" 
                v-model.number="config.alertes.seuil_ecart"
                class="form-control"
                min="0"
              >
            </div>
  
            <div class="form-group">
              <label>Notifications par email</label>
              <div class="email-notifications">
                <div 
                  v-for="(email, index) in config.alertes.emails_notification"
                  :key="index"
                  class="email-item"
                >
                  <input 
                    type="email" 
                    v-model="config.alertes.emails_notification[index]"
                    class="form-control"
                  >
                  <button 
                    class="btn-icon text-danger"
                    @click="supprimerEmail(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button 
                  class="btn btn-outline-secondary"
                  @click="ajouterEmail"
                >
                  <i class="fas fa-plus"></i>
                  Ajouter un email
                </button>
              </div>
            </div>
  
            <div class="notifications-options">
              <div class="form-check">
                <input 
                  type="checkbox"
                  v-model="config.alertes.notifier_ouverture"
                  class="form-check-input"
                  id="notif-ouverture"
                >
                <label class="form-check-label" for="notif-ouverture">
                  Notifier à l'ouverture de caisse
                </label>
              </div>
              <div class="form-check">
                <input 
                  type="checkbox"
                  v-model="config.alertes.notifier_cloture"
                  class="form-check-input"
                  id="notif-cloture"
                >
                <label class="form-check-label" for="notif-cloture">
                  Notifier à la clôture de caisse
                </label>
              </div>
              <div class="form-check">
                <input 
                  type="checkbox"
                  v-model="config.alertes.notifier_transferts"
                  class="form-check-input"
                  id="notif-transferts"
                >
                <label class="form-check-label" for="notif-transferts">
                  Notifier les transferts entre caisses
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de configuration mode de paiement -->
      <div class="modal" :class="{ 'show': showModeConfig }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Configuration {{ selectedMode?.nom }}</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeModeConfig"
              ></button>
            </div>
            <div class="modal-body" v-if="selectedMode">
              <div class="form-group">
                <label>Nom affiché</label>
                <input 
                  type="text" 
                  v-model="selectedMode.nom_affiche"
                  class="form-control"
                >
              </div>
  
              <div class="form-group">
                <label>Instructions de paiement</label>
                <textarea 
                  v-model="selectedMode.instructions"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
  
              <div class="form-group">
                <label>Délai de règlement (jours)</label>
                <input 
                  type="number" 
                  v-model.number="selectedMode.delai_reglement"
                  class="form-control"
                  min="0"
                >
              </div>
  
              <div class="form-check">
                <input 
                  type="checkbox"
                  v-model="selectedMode.demander_reference"
                  class="form-check-input"
                  id="demander-ref"
                >
                <label class="form-check-label" for="demander-ref">
                  Demander une référence de transaction
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeModeConfig"
              >
                Annuler
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="saveModeConfig"
              >
                Enregistrer
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
    name: 'ConfigCaisse',
  
    setup() {
      const store = useStore();
  
      // État
      const config = ref({
        general: {
          devise_principale: 'XOF',
          format_ticket: 'THERMAL',
          expiration_avoirs: 90,
          impression_automatique: true
        },
        remises: {
          max_remise: 20,
          remises_predefinies: [5, 10, 15],
          autorisation_requise: true
        },
        paiements: {
          modes: [
            {
              id: 1,
              nom: 'Espèces',
              actif: true,
              commission: 0,
              montant_min: 0,
              nom_affiche: 'Espèces',
              instructions: '',
              delai_reglement: 0,
              demander_reference: false
            },
            {
              id: 2,
              nom: 'Carte bancaire',
              actif: true,
              commission: 1.5,
              montant_min: 1000,
              nom_affiche: 'CB',
              instructions: 'Insérer la carte dans le terminal',
              delai_reglement: 2,
              demander_reference: true
            }
          ]
        },
        alertes: {
          seuil_ecart: 5000,
          emails_notification: [],
          notifier_ouverture: true,
          notifier_cloture: true,
          notifier_transferts: true
        }
      });
  
      const originalConfig = ref(null);
      const devises = ref([]);
      const showModeConfig = ref(false);
      const selectedMode = ref(null);
  
      // Computed
      const hasChanges = computed(() => {
        return JSON.stringify(config.value) !== JSON.stringify(originalConfig.value);
      });
  
      const sectionHasChanges = (section) => {
        return JSON.stringify(config.value[section]) !== 
               JSON.stringify(originalConfig.value[section]);
      };
  
      // Méthodes
      const loadConfig = async () => {
        try {
          const [configRes, devisesRes] = await Promise.all([
            api.get('/config/caisse'),
            api.get('/devises')
          ]);
          
          config.value = configRes.data;
          originalConfig.value = JSON.parse(JSON.stringify(configRes.data));
          devises.value = devisesRes.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement de la configuration'
          });
        }
      };
  
      const sauvegarderConfig = async () => {
        try {
          await api.put('/config/caisse', config.value);
          originalConfig.value = JSON.parse(JSON.stringify(config.value));
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Configuration enregistrée avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement de la configuration'
          });
        }
      };
  
      const resetSection = (section) => {
        config.value[section] = JSON.parse(
          JSON.stringify(originalConfig.value[section])
        );
      };
  
      const ajouterRemise = () => {
        config.value.remises.remises_predefinies.push(0);
      };
  
      const supprimerRemise = (index) => {
        config.value.remises.remises_predefinies.splice(index, 1);
      };
  
      const ajouterEmail = () => {
        config.value.alertes.emails_notification.push('');
      };
  
      const supprimerEmail = (index) => {
        config.value.alertes.emails_notification.splice(index, 1);
      };
  
      const configurerMode = (mode) => {
        selectedMode.value = { ...mode };
        showModeConfig.value = true;
      };
  
      const closeModeConfig = () => {
        showModeConfig.value = false;
        selectedMode.value = null;
      };
  
      const saveModeConfig = () => {
        const index = config.value.paiements.modes.findIndex(
          m => m.id === selectedMode.value.id
        );
        if (index !== -1) {
          config.value.paiements.modes[index] = { ...selectedMode.value };
        }
        closeModeConfig();
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadConfig();
      });
  
      return {
        config,
        devises,
        showModeConfig,
        selectedMode,
        hasChanges,
        sectionHasChanges,
        sauvegarderConfig,
        resetSection,
        ajouterRemise,
        supprimerRemise,
        ajouterEmail,
        supprimerEmail,
        configurerMode,
        closeModeConfig,
        saveModeConfig
      };
    }
  };
  </script>
  
  <style scoped>
  .config-caisse {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .config-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .config-card {
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
  
  .card-header h3 {
    margin: 0;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
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
  
  .form-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .remises-predefinies,
  .email-notifications {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .remise-item,
  .email-item {
    display: flex;
    gap: 0.5rem;
  }
  
  .mode-paiement {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .mode-paiement:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .mode-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .mode-options {
    padding-left: 2rem;
  }
  
  .notifications-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
  
  .btn-outline-secondary {
    background: transparent;
    border: 1px dashed #dee2e6;
    color: #6c757d;
    width: 100%;
    justify-content: center;
  }
  
  .btn-icon {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
  }
  
  .btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    .config-caisse {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .config-sections {
      grid-template-columns: 1fr;
    }
  
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>
  