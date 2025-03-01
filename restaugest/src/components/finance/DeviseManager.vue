<template>
  <div class="devise-manager">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Gestion des Devises</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Ajouter une devise
      </button>
    </div>

    <!-- Liste des devises -->
    <div class="devise-list">
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Nom</th>
            <th>Symbole</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="devise in devises" :key="devise.id">
            <td>{{ devise.code }}</td>
            <td>{{ devise.nom }}</td>
            <td>{{ devise.symbole }}</td>
            <td>
              <button class="btn btn-sm btn-primary me-2" @click="editDevise(devise)">
                <i class="fas fa-edit"></i> Modifier
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(devise)">
                <i class="fas fa-trash"></i> Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal d'ajout/modification -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal || editingDevise }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingDevise ? 'Modifier la devise' : 'Ajouter une devise' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDevise">
              <div class="mb-3">
                <label for="code" class="form-label">Code</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="code" 
                  v-model="currentDevise.code"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="nom" class="form-label">Nom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="nom" 
                  v-model="currentDevise.nom"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="symbole" class="form-label">Symbole</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="symbole" 
                  v-model="currentDevise.symbole"
                  required
                >
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer cette devise ?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteDevise" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deviseAPI } from '@/utils/api'

export default {
  name: 'DeviseManager',
  data() {
    return {
      devises: [],
      loading: false,
      error: null,
      showAddModal: false,
      showDeleteModal: false,
      editingDevise: null,
      currentDevise: {
        code: '',
        nom: '',
        symbole: ''
      },
      saving: false,
      deleting: false,
      deviseToDelete: null
    }
  },
  methods: {
    async fetchDevises() {
      this.loading = true
      this.error = null
      try {
        const response = await deviseAPI.getAll()
        this.devises = response.data
      } catch (error) {
        this.error = "Erreur lors de la récupération des devises"
        console.error('Erreur:', error)
      } finally {
        this.loading = false
      }
    },
    editDevise(devise) {
      this.editingDevise = devise
      this.currentDevise = { ...devise }
      this.showAddModal = true
    },
    async saveDevise() {
      this.saving = true
      try {
        if (this.editingDevise) {
          await deviseAPI.update(this.editingDevise.id, this.currentDevise)
        } else {
          await deviseAPI.create(this.currentDevise)
        }
        await this.fetchDevises()
        this.closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        this.saving = false
      }
    },
    confirmDelete(devise) {
      this.deviseToDelete = devise
      this.showDeleteModal = true
    },
    async deleteDevise() {
      if (!this.deviseToDelete) return

      this.deleting = true
      try {
        await deviseAPI.delete(this.deviseToDelete.id)
        await this.fetchDevises()
        this.showDeleteModal = false
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      } finally {
        this.deleting = false
        this.deviseToDelete = null
      }
    },
    closeModal() {
      this.showAddModal = false
      this.editingDevise = null
      this.currentDevise = {
        code: '',
        nom: '',
        symbole: ''
      }
    }
  },
  mounted() {
    this.fetchDevises()
  }
}
</script>

<style scoped>
.devise-manager {
  padding: 20px;
}

.devise-list {
  margin-top: 20px;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.d-block {
  display: block !important;
}

.btn-primary {
  background-color: #ff6600;
  border-color: #ff6600;
}

.btn-primary:hover {
  background-color: #e65c00;
  border-color: #e65c00;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
}
</style>
