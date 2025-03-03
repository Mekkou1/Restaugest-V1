<template>
    <div class="remise-manager">
      <div class="header-section">
        <h2>Gestion des remises</h2>
        <button 
          class="btn btn-primary"
          @click="ajouterRemise"
        >
          <i class="fas fa-plus"></i>
          Nouvelle remise
        </button>
      </div>
  
      <!-- Types de remises -->
      <div class="remises-grid">
        <!-- Remises prédéfinies -->
        <div class="remise-card">
          <div class="card-header">
            <h3>Remises prédéfinies</h3>
            <button 
              class="btn-icon"
              @click="ajouterRemisePredefined"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="card-content">
            <div 
              v-for="remise in remisesPredefinies"
              :key="remise.id"
              class="remise-item"
            >
              <div class="remise-info">
                <span class="remise-value">{{ remise.valeur }}%</span>
                <span class="remise-label">{{ remise.nom }}</span>
              </div>
              <div class="remise-actions">
                <button 
                  class="btn-icon"
                  @click="modifierRemise(remise)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn-icon text-danger"
                  @click="supprimerRemise(remise)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Remises conditionnelles -->
        <div class="remise-card">
          <div class="card-header">
            <h3>Remises conditionnelles</h3>
            <button 
              class="btn-icon"
              @click="ajouterRemiseConditionnelle"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="card-content">
            <div 
              v-for="remise in remisesConditionnelles"
              :key="remise.id"
              class="remise-item"
            >
              <div class="remise-info">
                <span class="remise-value">{{ remise.valeur }}%</span>
                <div class="remise-details">
                  <span class="remise-label">{{ remise.nom }}</span>
                  <small class="remise-condition">
                    {{ formatCondition(remise) }}
                  </small>
                </div>
              </div>
              <div class="remise-actions">
                <button 
                  class="btn-icon"
                  @click="modifierRemise(remise)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn-icon text-danger"
                  @click="supprimerRemise(remise)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Remises spéciales -->
        <div class="remise-card">
          <div class="card-header">
            <h3>Remises spéciales</h3>
            <button 
              class="btn-icon"
              @click="ajouterRemiseSpeciale"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="card-content">
            <div 
              v-for="remise in remisesSpeciales"
              :key="remise.id"
              class="remise-item"
            >
              <div class="remise-info">
                <span class="remise-value">{{ remise.valeur }}%</span>
                <div class="remise-details">
                  <span class="remise-label">{{ remise.nom }}</span>
                  <small class="remise-period">
                    {{ formatPeriod(remise) }}
                  </small>
                </div>
              </div>
              <div class="remise-status">
                <span 
                  class="status-badge"
                  :class="getStatusClass(remise.statut)"
                >
                  {{ remise.statut }}
                </span>
              </div>
              <div class="remise-actions">
                <button 
                  class="btn-icon"
                  @click="modifierRemise(remise)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn-icon text-danger"
                  @click="supprimerRemise(remise)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal d'ajout/modification -->
      <div class="modal" :class="{ 'show': showModal }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingRemise ? 'Modifier la remise' : 'Nouvelle remise' }}
              </h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeModal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveRemise">
                <div class="form-group">
                  <label>Nom de la remise</label>
                  <input 
                    type="text" 
                    v-model="remiseForm.nom"
                    class="form-control"
                    required
                  >
                </div>
  
                <div class="form-group">
                  <label>Type de remise</label>
                  <select 
                    v-model="remiseForm.type"
                    class="form-select"
                    required
                  >
                    <option value="PREDEFINED">Prédéfinie</option>
                    <option value="CONDITIONAL">Conditionnelle</option>
                    <option value="SPECIAL">Spéciale</option>
                  </select>
                </div>
  
                <div class="form-group">
                  <label>Valeur (%)</label>
                  <input 
                    type="number" 
                    v-model.number="remiseForm.valeur"
                    class="form-control"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  >
                </div>
  
                <!-- Conditions pour remises conditionnelles -->
                <div v-if="remiseForm.type === 'CONDITIONAL'">
                  <div class="form-group">
                    <label>Type de condition</label>
                    <select 
                      v-model="remiseForm.condition.type"
                      class="form-select"
                    >
                      <option value="MONTANT">Montant minimum</option>
                      <option value="QUANTITE">Quantité minimum</option>
                      <option value="CATEGORIE">Catégorie spécifique</option>
                    </select>
                  </div>
  
                  <div class="form-group">
                    <label>Valeur de la condition</label>
                    <input 
                      v-if="remiseForm.condition.type === 'MONTANT'"
                      type="number"
                      v-model.number="remiseForm.condition.valeur"
                      class="form-control"
                      min="0"
                    >
                    <input 
                      v-else-if="remiseForm.condition.type === 'QUANTITE'"
                      type="number"
                      v-model.number="remiseForm.condition.valeur"
                      class="form-control"
                      min="1"
                    >
                    <select 
                      v-else
                      v-model="remiseForm.condition.valeur"
                      class="form-select"
                    >
                      <option 
                        v-for="cat in categories"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ cat.nom }}
                      </option>
                    </select>
                  </div>
                </div>
  
                <!-- Période pour remises spéciales -->
                <div v-if="remiseForm.type === 'SPECIAL'">
                  <div class="form-group">
                    <label>Date de début</label>
                    <input 
                      type="date" 
                      v-model="remiseForm.periode.debut"
                      class="form-control"
                      :min="today"
                    >
                  </div>
  
                  <div class="form-group">
                    <label>Date de fin</label>
                    <input 
                      type="date" 
                      v-model="remiseForm.periode.fin"
                      class="form-control"
                      :min="remiseForm.periode.debut || today"
                    >
                  </div>
  
                  <div class="form-group">
                    <label>Jours d'application</label>
                    <div class="days-selector">
                      <button 
                        v-for="jour in jours"
                        :key="jour.value"
                        type="button"
                        class="day-btn"
                        :class="{ active: remiseForm.periode.jours.includes(jour.value) }"
                        @click="toggleJour(jour.value)"
                      >
                        {{ jour.label }}
                      </button>
                    </div>
                  </div>
  
                  <div class="form-group">
                    <label>Heures d'application</label>
                    <div class="hours-inputs">
                      <div class="time-input">
                        <label>De</label>
                        <input 
                          type="time"
                          v-model="remiseForm.periode.heure_debut"
                          class="form-control"
                        >
                      </div>
                      <div class="time-input">
                        <label>À</label>
                        <input 
                          type="time"
                          v-model="remiseForm.periode.heure_fin"
                          class="form-control"
                        >
                      </div>
                    </div>
                  </div>
                </div>
  
                <div class="form-group">
                  <label>Description</label>
                  <textarea 
                    v-model="remiseForm.description"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
  
                <div class="form-checks">
                  <div class="form-check">
                    <input 
                      type="checkbox"
                      v-model="remiseForm.autorisation_requise"
                      class="form-check-input"
                      id="auth"
                    >
                    <label class="form-check-label" for="auth">
                      Autorisation requise
                    </label>
                  </div>
  
                  <div class="form-check">
                    <input 
                      type="checkbox"
                      v-model="remiseForm.active"
                      class="form-check-input"
                      id="active"
                    >
                    <label class="form-check-label" for="active">
                      Remise active
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeModal"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                @click="saveRemise"
              >
                {{ editingRemise ? 'Enregistrer' : 'Ajouter' }}
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
                Êtes-vous sûr de vouloir supprimer la remise 
                <strong>{{ remiseToDelete?.nom }}</strong> ?
              </p>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Cette action est irréversible.
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
    name: 'RemiseManager',
  
    setup() {
      const store = useStore();
  
      // État
      const remisesPredefinies = ref([]);
      const remisesConditionnelles = ref([]);
      const remisesSpeciales = ref([]);
      const categories = ref([]);
      const showModal = ref(false);
      const showDelete = ref(false);
      const editingRemise = ref(null);
      const remiseToDelete = ref(null);
  
      const jours = [
        { value: 1, label: 'L' },
        { value: 2, label: 'M' },
        { value: 3, label: 'M' },
        { value: 4, label: 'J' },
        { value: 5, label: 'V' },
        { value: 6, label: 'S' },
        { value: 0, label: 'D' }
      ];
  
      const remiseForm = ref({
        nom: '',
        type: 'PREDEFINED',
        valeur: 0,
        description: '',
        condition: {
          type: 'MONTANT',
          valeur: 0
        },
        periode: {
          debut: '',
          fin: '',
          jours: [],
          heure_debut: '',
          heure_fin: ''
        },
        autorisation_requise: false,
        active: true
      });
  
      // Computed
      const today = computed(() => {
        return new Date().toISOString().split('T')[0];
      });
  
      // Méthodes
      const loadData = async () => {
        try {
          const [remisesRes, categoriesRes] = await Promise.all([
            api.get('/remises'),
            api.get('/categories')
          ]);
  
          remisesPredefinies.value = remisesRes.data.filter(r => r.type === 'PREDEFINED');
          remisesConditionnelles.value = remisesRes.data.filter(r => r.type === 'CONDITIONAL');
          remisesSpeciales.value = remisesRes.data.filter(r => r.type === 'SPECIAL');
          categories.value = categoriesRes.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des données'
          });
        }
      };
  
      const ajouterRemise = () => {
        editingRemise.value = null;
        remiseForm.value = {
          nom: '',
          type: 'PREDEFINED',
          valeur: 0,
          description: '',
          condition: {
            type: 'MONTANT',
            valeur: 0
          },
          periode: {
            debut: '',
            fin: '',
            jours: [],
            heure_debut: '',
            heure_fin: ''
          },
          autorisation_requise: false,
          active: true
        };
        showModal.value = true;
      };
  
      const ajouterRemisePredefined = () => {
        remiseForm.value.type = 'PREDEFINED';
        showModal.value = true;
      };
  
      const ajouterRemiseConditionnelle = () => {
        remiseForm.value.type = 'CONDITIONAL';
        showModal.value = true;
      };
  
      const ajouterRemiseSpeciale = () => {
        remiseForm.value.type = 'SPECIAL';
        showModal.value = true;
      };
  
      const modifierRemise = (remise) => {
        editingRemise.value = remise;
        remiseForm.value = { ...remise };
        showModal.value = true;
      };
  
      const closeModal = () => {
        showModal.value = false;
        editingRemise.value = null;
        remiseForm.value = {
          nom: '',
          type: 'PREDEFINED',
          valeur: 0,
          description: '',
          condition: {
            type: 'MONTANT',
            valeur: 0
          },
          periode: {
            debut: '',
            fin: '',
            jours: [],
            heure_debut: '',
            heure_fin: ''
          },
          autorisation_requise: false,
          active: true
        };
      };
  
      const saveRemise = async () => {
        try {
          if (editingRemise.value) {
            await api.put(`/remises/${editingRemise.value.id}`, remiseForm.value);
          } else {
            await api.post('/remises', remiseForm.value);
          }
  
          await loadData();
          closeModal();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: `Remise ${editingRemise.value ? 'modifiée' : 'ajoutée'} avec succès`
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      };
  
      const supprimerRemise = (remise) => {
        remiseToDelete.value = remise;
        showDelete.value = true;
      };
  
      const confirmDelete = async () => {
        try {
          await api.delete(`/remises/${remiseToDelete.value.id}`);
          await loadData();
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Remise supprimée avec succès'
          });
  
          showDelete.value = false;
          remiseToDelete.value = null;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la suppression'
          });
        }
      };
  
      const toggleJour = (jour) => {
        const index = remiseForm.value.periode.jours.indexOf(jour);
        if (index === -1) {
          remiseForm.value.periode.jours.push(jour);
        } else {
          remiseForm.value.periode.jours.splice(index, 1);
        }
      };
  
      const formatCondition = (remise) => {
        switch (remise.condition.type) {
          case 'MONTANT':
            return `À partir de ${formatPrice(remise.condition.valeur)}`;
          case 'QUANTITE':
            return `${remise.condition.valeur} articles ou plus`;
          case 'CATEGORIE':
            const categorie = categories.value.find(c => c.id === remise.condition.valeur);
            return `Sur la catégorie ${categorie?.nom || ''}`;
          default:
            return '';
        }
      };
  
      const formatPeriod = (remise) => {
        const debut = new Date(remise.periode.debut).toLocaleDateString('fr-FR');
        const fin = new Date(remise.periode.fin).toLocaleDateString('fr-FR');
        return `Du ${debut} au ${fin}`;
      };
  
      const getStatusClass = (statut) => {
        const classes = {
          'ACTIVE': 'status-active',
          'INACTIVE': 'status-inactive',
          'EXPIRED': 'status-expired',
          'SCHEDULED': 'status-scheduled'
        };
        return classes[statut] || '';
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadData();
      });
  
      return {
        remisesPredefinies,
        remisesConditionnelles,
        remisesSpeciales,
        categories,
        showModal,
        showDelete,
        editingRemise,
        remiseToDelete,
        remiseForm,
        jours,
        today,
        ajouterRemise,
        ajouterRemisePredefined,
        ajouterRemiseConditionnelle,
        ajouterRemiseSpeciale,
        modifierRemise,
        closeModal,
        saveRemise,
        supprimerRemise,
        confirmDelete,
        toggleJour,
        formatCondition,
        formatPeriod,
        getStatusClass,
        formatPrice
      };
    }
  };
  </script>
  
  <style scoped>
  .remise-manager {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .remises-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .remise-card {
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
  
  .remise-item {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #dee2e6;
  }
  
  .remise-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .remise-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .remise-value {
    font-size: 1.25rem;
    font-weight: 500;
    color: #ff6600;
  }
  
  .remise-details {
    display: flex;
    flex-direction: column;
  }
  
  .remise-label {
    font-weight: 500;
  }
  
  .remise-condition,
  .remise-period {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .remise-status {
    margin: 0 1rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }
  
  .status-active {
    background: #d1e7dd;
    color: #0f5132;
  }
  
  .status-inactive {
    background: #f8d7da;
    color: #842029;
  }
  
  .status-expired {
    background: #e2e3e5;
    color: #41464b;
  }
  
  .status-scheduled {
    background: #cff4fc;
    color: #055160;
  }
  
  .remise-actions {
    display: flex;
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
  
  .days-selector {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .day-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: white;
    color: #6c757d;
    cursor: pointer;
  }
  
  .day-btn.active {
    background: #ff6600;
    color: white;
    border-color: #ff6600;
  }
  
  .hours-inputs {
    display: flex;
    gap: 1rem;
  }
  
  .time-input {
    flex: 1;
  }
  
  .time-input label {
    font-size: 0.875rem;
    color: #6c757d;
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
    .remise-manager {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .header-section .btn {
      width: 100%;
    }
  
    .remises-grid {
      grid-template-columns: 1fr;
    }
  
    .remise-item {
      flex-wrap: wrap;
    }
  
    .remise-info {
      width: 100%;
      margin-bottom: 1rem;
    }
  
    .remise-status {
      margin: 0;
      margin-bottom: 1rem;
    }
  
    .remise-actions {
      width: 100%;
      justify-content: flex-end;
    }
  
    .days-selector {
      flex-wrap: wrap;
    }
  
    .hours-inputs {
      flex-direction: column;
    }
  }
  </style>
  