<template>
    <div class="impression-manager">
      <div class="header-section">
        <h2>Gestion des impressions</h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary"
            @click="testerImprimante"
          >
            <i class="fas fa-print"></i>
            Tester l'imprimante
          </button>
          <button 
            class="btn btn-primary"
            @click="sauvegarderConfig"
            :disabled="!hasChanges"
          >
            <i class="fas fa-save"></i>
            Enregistrer
          </button>
        </div>
      </div>
  
      <!-- Configuration de l'imprimante -->
      <div class="config-grid">
        <!-- Paramètres de l'imprimante -->
        <div class="config-card">
          <div class="card-header">
            <h3>Paramètres de l'imprimante</h3>
            <div class="printer-status">
              <i 
                :class="getPrinterStatusIcon"
                :title="getPrinterStatusText"
              ></i>
            </div>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label>Type d'imprimante</label>
              <select v-model="config.printer.type" class="form-select">
                <option value="THERMAL">Imprimante thermique</option>
                <option value="LASER">Imprimante laser</option>
                <option value="NETWORK">Imprimante réseau</option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Nom de l'imprimante</label>
              <input 
                type="text" 
                v-model="config.printer.name"
                class="form-control"
                placeholder="Nom de l'imprimante"
              >
            </div>
  
            <div v-if="config.printer.type === 'NETWORK'" class="form-group">
              <label>Adresse IP</label>
              <input 
                type="text" 
                v-model="config.printer.ip"
                class="form-control"
                placeholder="192.168.1.100"
              >
            </div>
  
            <div class="form-group">
              <label>Format du papier</label>
              <select v-model="config.printer.format" class="form-select">
                <option value="80MM">80mm (standard)</option>
                <option value="58MM">58mm (compact)</option>
                <option value="A4">A4</option>
              </select>
            </div>
  
            <div class="form-checks">
              <div class="form-check">
                <input 
                  type="checkbox"
                  v-model="config.printer.cut"
                  class="form-check-input"
                  id="cut"
                >
                <label class="form-check-label" for="cut">
                  Découpe automatique
                </label>
              </div>
  
              <div class="form-check">
                <input 
                  type="checkbox"
                  v-model="config.printer.drawer"
                  class="form-check-input"
                  id="drawer"
                >
                <label class="form-check-label" for="drawer">
                  Ouvrir le tiroir-caisse
                </label>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Contenu du ticket -->
        <div class="config-card">
          <div class="card-header">
            <h3>Contenu du ticket</h3>
            <button 
              class="btn-icon"
              @click="previsualiserTicket"
            >
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label>En-tête du ticket</label>
              <textarea 
                v-model="config.content.header"
                class="form-control"
                rows="3"
                placeholder="Nom du restaurant, adresse, etc."
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>Message de remerciement</label>
              <textarea 
                v-model="config.content.footer"
                class="form-control"
                rows="2"
                placeholder="Merci de votre visite !"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>Informations complémentaires</label>
              <div class="info-checks">
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.content.showTVA"
                    class="form-check-input"
                    id="tva"
                  >
                  <label class="form-check-label" for="tva">
                    Afficher la TVA
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.content.showServeur"
                    class="form-check-input"
                    id="serveur"
                  >
                  <label class="form-check-label" for="serveur">
                    Nom du serveur
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.content.showTable"
                    class="form-check-input"
                    id="table"
                  >
                  <label class="form-check-label" for="table">
                    Numéro de table
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.content.showQRCode"
                    class="form-check-input"
                    id="qr"
                  >
                  <label class="form-check-label" for="qr">
                    QR Code
                  </label>
                </div>
              </div>
            </div>
  
            <div class="form-group">
              <label>Logo</label>
              <div class="logo-upload">
                <img 
                  v-if="config.content.logo"
                  :src="config.content.logo"
                  class="logo-preview"
                  alt="Logo"
                >
                <div v-else class="logo-placeholder">
                  <i class="fas fa-image"></i>
                  <span>Aucun logo</span>
                </div>
                <div class="logo-actions">
                  <button 
                    class="btn btn-outline-secondary"
                    @click="selectLogo"
                  >
                    <i class="fas fa-upload"></i>
                    Changer
                  </button>
                  <button 
                    v-if="config.content.logo"
                    class="btn btn-outline-danger"
                    @click="removeLogo"
                  >
                    <i class="fas fa-trash"></i>
                    Supprimer
                  </button>
                </div>
                <input 
                  type="file"
                  ref="logoInput"
                  style="display: none"
                  accept="image/*"
                  @change="handleLogoUpload"
                >
              </div>
            </div>
          </div>
        </div>
  
        <!-- Options d'impression -->
        <div class="config-card">
          <div class="card-header">
            <h3>Options d'impression</h3>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label>Nombre de copies</label>
              <div class="copies-config">
                <div class="copy-item">
                  <span>Client</span>
                  <input 
                    type="number" 
                    v-model.number="config.options.copiesClient"
                    class="form-control"
                    min="1"
                    max="3"
                  >
                </div>
                <div class="copy-item">
                  <span>Cuisine</span>
                  <input 
                    type="number" 
                    v-model.number="config.options.copiesCuisine"
                    class="form-control"
                    min="0"
                    max="3"
                  >
                </div>
                <div class="copy-item">
                  <span>Comptabilité</span>
                  <input 
                    type="number" 
                    v-model.number="config.options.copiesCompta"
                    class="form-control"
                    min="0"
                    max="3"
                  >
                </div>
              </div>
            </div>
  
            <div class="form-group">
              <label>Impression automatique</label>
              <div class="auto-print-checks">
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.options.printOnPayment"
                    class="form-check-input"
                    id="payment"
                  >
                  <label class="form-check-label" for="payment">
                    À l'encaissement
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.options.printOnOrder"
                    class="form-check-input"
                    id="order"
                  >
                  <label class="form-check-label" for="order">
                    À la commande
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.options.printOnClose"
                    class="form-check-input"
                    id="close"
                  >
                  <label class="form-check-label" for="close">
                    À la clôture
                  </label>
                </div>
              </div>
            </div>
  
            <div class="form-group">
              <label>Options avancées</label>
              <div class="advanced-checks">
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.options.groupItems"
                    class="form-check-input"
                    id="group"
                  >
                  <label class="form-check-label" for="group">
                    Regrouper les articles identiques
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.options.showCategories"
                    class="form-check-input"
                    id="categories"
                  >
                  <label class="form-check-label" for="categories">
                    Afficher les catégories
                  </label>
                </div>
  
                <div class="form-check">
                  <input 
                    type="checkbox"
                    v-model="config.options.showPricePerUnit"
                    class="form-check-input"
                    id="unit"
                  >
                  <label class="form-check-label" for="unit">
                    Prix unitaire
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de prévisualisation -->
      <div class="modal" :class="{ 'show': showPreview }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Prévisualisation du ticket</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="showPreview = false"
              ></button>
            </div>
            <div class="modal-body">
              <div class="ticket-preview">
                <div class="preview-content">
                  <!-- En-tête -->
                  <div v-if="config.content.logo" class="preview-logo">
                    <img :src="config.content.logo" alt="Logo">
                  </div>
                  <div class="preview-header">
                    {{ config.content.header }}
                  </div>
  
                  <!-- Informations -->
                  <div class="preview-info">
                    <div>Date: {{ formatDate(new Date()) }}</div>
                    <div>Ticket: #123456</div>
                    <div v-if="config.content.showTable">Table: 12</div>
                    <div v-if="config.content.showServeur">Serveur: John Doe</div>
                  </div>
  
                  <!-- Articles -->
                  <div class="preview-items">
                    <div class="preview-item">
                      <div class="item-details">
                        <span>Salade César</span>
                        <span>x2</span>
                      </div>
                      <div class="item-price">6 000 FCFA</div>
                    </div>
                    <div class="preview-item">
                      <div class="item-details">
                        <span>Coca Cola</span>
                        <span>x3</span>
                      </div>
                      <div class="item-price">3 000 FCFA</div>
                    </div>
                  </div>
  
                  <!-- Totaux -->
                  <div class="preview-totals">
                    <div class="total-row">
                      <span>Sous-total:</span>
                      <span>9 000 FCFA</span>
                    </div>
                    <div v-if="config.content.showTVA" class="total-row">
                      <span>TVA (18%):</span>
                      <span>1 620 FCFA</span>
                    </div>
                    <div class="total-row total">
                      <span>Total:</span>
                      <span>10 620 FCFA</span>
                    </div>
                  </div>
  
                  <!-- Pied de page -->
                  <div class="preview-footer">
                    {{ config.content.footer }}
                  </div>
  
                  <!-- QR Code -->
                  <div v-if="config.content.showQRCode" class="preview-qr">
                    <img src="data:image/png;base64,..." alt="QR Code">
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="showPreview = false"
              >
                Fermer
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="imprimerTest"
              >
                Imprimer test
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
    name: 'ImpressionManager',
  
    setup() {
      const store = useStore();
      const logoInput = ref(null);
  
      // État
      const config = ref({
        printer: {
          type: 'THERMAL',
          name: '',
          ip: '',
          format: '80MM',
          cut: true,
          drawer: true,
          status: 'OFFLINE'
        },
        content: {
          header: '',
          footer: '',
          logo: null,
          showTVA: true,
          showServeur: true,
          showTable: true,
          showQRCode: false
        },
        options: {
          copiesClient: 1,
          copiesCuisine: 1,
          copiesCompta: 1,
          printOnPayment: true,
          printOnOrder: false,
          printOnClose: true,
          groupItems: true,
          showCategories: false,
          showPricePerUnit: true
        }
      });
  
      const originalConfig = ref(null);
      const showPreview = ref(false);
  
      // Computed
      const hasChanges = computed(() => {
        return JSON.stringify(config.value) !== JSON.stringify(originalConfig.value);
      });
  
      const getPrinterStatusIcon = computed(() => {
        const icons = {
          'ONLINE': 'fas fa-check-circle text-success',
          'OFFLINE': 'fas fa-times-circle text-danger',
          'ERROR': 'fas fa-exclamation-circle text-warning'
        };
        return icons[config.value.printer.status] || icons.OFFLINE;
      });
  
      const getPrinterStatusText = computed(() => {
        const texts = {
          'ONLINE': 'Imprimante connectée',
          'OFFLINE': 'Imprimante non connectée',
          'ERROR': 'Erreur de connexion'
        };
        return texts[config.value.printer.status] || texts.OFFLINE;
      });
  
      // Méthodes
      const loadConfig = async () => {
        try {
          const response = await api.get('/impression/config');
          config.value = response.data;
          originalConfig.value = JSON.parse(JSON.stringify(response.data));
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement de la configuration'
          });
        }
      };
  
      const sauvegarderConfig = async () => {
        try {
          await api.put('/impression/config', config.value);
          originalConfig.value = JSON.parse(JSON.stringify(config.value));
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Configuration enregistrée avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      };
  
      const testerImprimante = async () => {
        try {
          await api.post('/impression/test');
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Test d\'impression envoyé'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du test d\'impression'
          });
        }
      };
  
      const selectLogo = () => {
        logoInput.value.click();
      };
  
      const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
  
        const formData = new FormData();
        formData.append('logo', file);
  
        try {
          const response = await api.post('/impression/logo', formData);
          config.value.content.logo = response.data.url;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du téléchargement du logo'
          });
        }
      };
  
      const removeLogo = async () => {
        try {
          await api.delete('/impression/logo');
          config.value.content.logo = null;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la suppression du logo'
          });
        }
      };
  
      const previsualiserTicket = () => {
        showPreview.value = true;
      };
  
      const imprimerTest = async () => {
        try {
          await api.post('/impression/test-preview');
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Impression test envoyée'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'impression test'
          });
        }
      };
  
      const formatDate = (date) => {
        return date.toLocaleString('fr-FR');
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadConfig();
      });
  
      return {
        config,
        logoInput,
        showPreview,
        hasChanges,
        getPrinterStatusIcon,
        getPrinterStatusText,
        sauvegarderConfig,
        testerImprimante,
        selectLogo,
        handleLogoUpload,
        removeLogo,
        previsualiserTicket,
        imprimerTest,
        formatDate
      };
    }
  };
  </script>
  
  <style scoped>
  .impression-manager {
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
  
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
  
  .form-checks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .logo-upload {
    text-align: center;
  }
  
  .logo-preview {
    max-width: 200px;
    max-height: 100px;
    margin-bottom: 1rem;
  }
  
  .logo-placeholder {
    width: 200px;
    height: 100px;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: #6c757d;
  }
  
  .logo-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .copies-config {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .copy-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .copy-item span {
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .auto-print-checks,
  .advanced-checks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
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
    max-width: 400px;
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
  
  .ticket-preview {
    background: white;
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-family: monospace;
  }
  
  .preview-content {
    max-width: 300px;
    margin: 0 auto;
  }
  
  .preview-logo {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .preview-logo img {
    max-width: 150px;
    max-height: 75px;
  }
  
  .preview-header {
    text-align: center;
    white-space: pre-line;
    margin-bottom: 1rem;
  }
  
  .preview-info {
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .preview-items {
    margin-bottom: 1rem;
  }
  
  .preview-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .item-details {
    display: flex;
    gap: 0.5rem;
  }
  
  .preview-totals {
    border-top: 1px dashed #dee2e6;
    padding-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }
  
  .total-row.total {
    font-weight: bold;
    border-top: 1px dashed #dee2e6;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .preview-footer {
    text-align: center;
    white-space: pre-line;
    margin-bottom: 1rem;
  }
  
  .preview-qr {
    text-align: center;
  }
  
  .preview-qr img {
    width: 100px;
    height: 100px;
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
    border: 1px solid #dee2e6;
    color: #6c757d;
  }
  
  .btn-outline-danger {
    background: transparent;
    border: 1px solid #dc3545;
    color: #dc3545;
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
  
  /* Responsive */
  @media (max-width: 768px) {
    .impression-manager {
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
  
    .config-grid {
      grid-template-columns: 1fr;
    }
  
    .copies-config {
      grid-template-columns: 1fr;
    }
  
    .auto-print-checks,
    .advanced-checks {
      grid-template-columns: 1fr;
    }
  }
  </style>
  