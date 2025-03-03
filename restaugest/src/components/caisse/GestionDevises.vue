<template>
  <div class="gestion-devises">
    <div class="header-section">
      <h2>Gestion des devises</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i>
        Nouvelle devise
      </button>
    </div>

    <!-- Notification Section -->
    <div v-if="newCurrencyNotification" class="notification">
      Nouvelle devise ajoutée: {{ newCurrencyNotification.code }} - {{ newCurrencyNotification.nom }}
    </div>

    <!-- Liste des devises -->
    <div class="devises-grid">
      <div v-for="devise in devises" :key="devise.id" class="devise-card" :class="{ 'devise-principale': devise.principale }">
        <div class="devise-header">
          <div class="devise-info">
            <span class="devise-code">{{ devise.code }}</span>
            <span class="devise-nom">{{ devise.nom }}</span>
            <span v-if="devise.principale" class="badge-principale">Devise principale</span>
          </div>
          <div class="devise-actions">
            <button class="btn-icon" @click="editDevise(devise)" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="!devise.principale" class="btn-icon text-danger" @click="deleteDevise(devise)" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="devise-content">
          <div class="taux-section">
            <h4>Taux de change</h4>
            <div class="taux-info">
              <span>1 {{ devise.code }} =</span>
              <span class="taux">{{ devise.taux }} XOF</span>
            </div>
            <small class="update-info">Mis à jour le {{ formatDate(devise.date_maj) }}</small>
          </div>

          <div class="config-section">
            <div class="config-item">
              <span class="label">Symbole:</span>
              <span class="value">{{ devise.symbole }}</span>
            </div>
            <div class="config-item">
              <span class="label">Format:</span>
              <span class="value">{{ devise.format }}</span>
            </div>
            <div class="config-item">
              <span class="label">Décimales:</span>
              <span class="value">{{ devise.decimales }}</span>
            </div>
          </div>
        </div>

        <div class="devise-footer">
          <label class="toggle-switch">
            <input type="checkbox" v-model="devise.active" @change="toggleDevise(devise)">
            <span class="slider"></span>
            <span class="toggle-label">{{ devise.active ? 'Activée' : 'Désactivée' }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Modal Ajout/Modification -->
    <div class="modal" :class="{ 'show': showAddModal || editingDevise }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingDevise ? 'Modifier la devise' : 'Nouvelle devise' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDevise">
              <div class="form-group">
                <label>Code ISO</label>
                <input type="text" v-model="deviseForm.code" class="form-control" maxlength="3" placeholder="Ex: EUR" required>
              </div>

              <div class="form-group">
                <label>Nom</label>
                <input type="text" v-model="deviseForm.nom" class="form-control" placeholder="Ex: Euro" required>
              </div>

              <div class="form-group">
                <label>Symbole</label>
                <input type="text" v-model="deviseForm.symbole" class="form-control" placeholder="Ex: €" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Taux de change</label>
                  <div class="taux-input">
                    <span class="prefix">1 {{ deviseForm.code || 'XXX' }} =</span>
                    <input type="number" v-model.number="deviseForm.taux" class="form-control" step="0.0001" min="0" required>
                    <span class="suffix">XOF</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Décimales</label>
                  <input type="number" v-model.number="deviseForm.decimales" class="form-control" min="0" max="4" required>
                </div>
              </div>

              <div class="form-group">
                <label>Format d'affichage</label>
                <select v-model="deviseForm.format" class="form-select" required>
                  <option value="symbol_before">Symbole avant (€123.45)</option>
                  <option value="symbol_after">Symbole après (123.45€)</option>
                  <option value="code_before">Code avant (EUR 123.45)</option>
                  <option value="code_after">Code après (123.45 EUR)</option>
                </select>
              </div>

              <div class="form-check">
                <input type="checkbox" v-model="deviseForm.active" class="form-check-input" id="active">
                <label class="form-check-label" for="active">Devise active</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">{{ editingDevise ? 'Enregistrer' : 'Ajouter' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal" :class="{ 'show': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer la devise <strong>{{ deviseToDelete?.code }}</strong> ?</p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Cette action est irréversible et pourrait affecter les transactions existantes.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


  
<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import api from '@/utils/api';

export default {
  name: 'GestionDevises',

  setup() {
    const store = useStore();

    // État
    const devises = ref([]);
    const showAddModal = ref(false);
    const editingDevise = ref(null);
    const showDeleteModal = ref(false);
    const deviseToDelete = ref(null);
    const deviseForm = ref({
      code: '',
      nom: '',
      symbole: '',
      taux: 1,
      decimales: 2,
      format: 'symbol_before',
      active: true
    });
    const newCurrencyNotification = ref(null);

    // Computed
    const isFormValid = computed(() => {
      return deviseForm.value.code &&
        deviseForm.value.nom &&
        deviseForm.value.symbole &&
        deviseForm.value.taux > 0;
    });

    // Méthodes
    const loadDevises = async () => {
      try {
        const response = await api.get('/devises');
        devises.value = response.data;
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors du chargement des devises'
        });
      }
    };

    const editDevise = (devise) => {
      editingDevise.value = devise;
      deviseForm.value = { ...devise };
      showAddModal.value = true;
    };

    const deleteDevise = (devise) => {
      deviseToDelete.value = devise;
      showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
      try {
        await api.delete(`/devises/${deviseToDelete.value.id}`);
        await loadDevises();

        store.dispatch('showNotification', {
          type: 'success',
          message: 'Devise supprimée avec succès'
        });

        showDeleteModal.value = false;
        deviseToDelete.value = null;
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de la suppression'
        });
      }
    };

    const saveDevise = async () => {
      try {
        if (editingDevise.value) {
          await api.put(`/devises/${editingDevise.value.id}`, deviseForm.value);
        } else {
          await api.post('/devises', deviseForm.value);
          newCurrencyNotification.value = { ...deviseForm.value };
          setTimeout(() => {
            newCurrencyNotification.value = null;
          }, 5000);
        }

        await loadDevises();
        closeModal();

        store.dispatch('showNotification', {
          type: 'success',
          message: `Devise ${editingDevise.value ? 'modifiée' : 'ajoutée'} avec succès`
        });
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'enregistrement'
        });
      }
    };

    const toggleDevise = async (devise) => {
      try {
        await api.put(`/devises/${devise.id}/toggle`, {
          active: devise.active
        });

        store.dispatch('showNotification', {
          type: 'success',
          message: `Devise ${devise.active ? 'activée' : 'désactivée'}`
        });
      } catch (error) {
        devise.active = !devise.active; // Revert change
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors du changement de statut'
        });
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      editingDevise.value = null;
      deviseForm.value = {
        code: '',
        nom: '',
        symbole: '',
        taux: 1,
        decimales: 2,
        format: 'symbol_before',
        active: true
      };
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    };

    const subscribeToCurrencyUpdates = () => {
      // Simulate real-time updates using setInterval
      setInterval(async () => {
        await loadDevises();
      }, 60000); // Update every 60 seconds
    };

    // Lifecycle hooks
    onMounted(() => {
      loadDevises();
      subscribeToCurrencyUpdates();
    });

    onUnmounted(() => {
      // Clean up the interval when the component is unmounted
      clearInterval(subscribeToCurrencyUpdates);
    });

    return {
      devises,
      showAddModal,
      editingDevise,
      showDeleteModal,
      deviseToDelete,
      deviseForm,
      isFormValid,
      newCurrencyNotification,
      editDevise,
      deleteDevise,
      confirmDelete,
      saveDevise,
      toggleDevise,
      closeModal,
      formatDate
    };
  }
};
</script>

  
<style scoped>
.gestion-devises {
  padding: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.notification {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.devises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.devise-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.devise-card.devise-principale {
  border: 2px solid #ff6600;
}

.devise-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.devise-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.devise-code {
  font-size: 1.25rem;
  font-weight: 500;
}

.devise-nom {
  color: #6c757d;
}

.badge-principale {
  background: #ff6600;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.devise-actions {
  display: flex;
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

.devise-content {
  padding: 1.5rem;
}

.taux-section {
  margin-bottom: 1.5rem;
}

.taux-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1.25rem;
}

.taux {
  font-weight: 500;
  color: #ff6600;
}

.update-info {
  color: #6c757d;
  font-size: 0.875rem;
}

.config-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  color: #6c757d;
  font-size: 0.875rem;
}

.value {
  font-weight: 500;
}

.devise-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
}

.toggle-switch {
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
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
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
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.taux-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.taux-input .form-control {
  text-align: right;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.alert-warning {
  background: #fff3cd;
  color: #664d03;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Buttons */
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

/* Responsive */
@media (max-width: 768px) {
  .gestion-devises {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
