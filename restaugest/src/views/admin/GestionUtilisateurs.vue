<template>
  <div class="gestion-utilisateurs">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Gestion des Utilisateurs</h4>
        <button class="btn btn-primary" @click="showAddUserModal = true">
          <i class="fas fa-plus"></i> Nouvel Utilisateur
        </button>
      </div>

      <div class="card-body">
        <!-- Filtres -->
        <div class="row mb-4">
          <div class="col-md-3">
            <select v-model="roleFilter" class="form-select">
              <option value="">Tous les rôles</option>
              <option value="Administrateur">Administrateur</option>
              <option value="Caissier">Caissier</option>
              <option value="Serveur">Serveur</option>
              <option value="Cuisinier">Cuisinier</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select">
              <option value="">Tous les états</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Connecté">Connecté</option>
              <option value="Déconnecté">Déconnecté</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>
          <div class="col-md-6">
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control" 
              placeholder="Rechercher un utilisateur..."
            >
          </div>
        </div>

        <!-- Tableau des utilisateurs -->
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Pseudo</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>État</th>
                <th>Dernière connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.nom }} {{ user.prenom }}</td>
                <td>{{ user.pseudo }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(user.etat)">
                    {{ user.etat }}
                  </span>
                </td>
                <td>
                  {{ formatDate(user.derniere_connexion) }}
                  <small v-if="user.tentatives_connexion > 0" class="text-danger">
                    ({{ user.tentatives_connexion }} tentatives)
                  </small>
                </td>
                <td>
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-primary" 
                      @click="editUser(user)"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-warning" 
                      @click="toggleUserStatus(user)"
                      title="Changer l'état"
                    >
                      <i class="fas fa-power-off"></i>
                    </button>
                    <button 
                      v-if="user.tentatives_connexion > 0"
                      class="btn btn-sm btn-info" 
                      @click="resetAttempts(user)"
                      title="Réinitialiser les tentatives"
                    >
                      <i class="fas fa-redo"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-danger" 
                      @click="confirmDelete(user)"
                      title="Supprimer"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Ajout/Modification -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddUserModal || editingUser }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
            </h5>
            <button type="button" class="btn-close" @click="closeUserModal"></button>
          </div>
          <div class="modal-body">
            <FormulaireUtilisateur 
              :utilisateur="currentUser"
              @sauvegarder="saveUser"
              @fermer="closeUserModal"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddUserModal || editingUser"></div>

    <!-- Modal de confirmation -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
            <p class="text-danger">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteUser"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import FormulaireUtilisateur from './FormulaireUtilisateur.vue';

export default {
  name: 'GestionUtilisateurs',
  
  components: {
    FormulaireUtilisateur
  },

  setup() {
    const store = useStore();
    const showAddUserModal = ref(false);
    const showDeleteModal = ref(false);
    const editingUser = ref(null);
    const userToDelete = ref(null);
    const loading = ref(false);
    const roleFilter = ref('');
    const statusFilter = ref('');
    const searchQuery = ref('');

    const users = computed(() => store.getters['users/getUsers']);
    const currentUser = computed(() => editingUser.value || {});

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesRole = !roleFilter.value || user.role === roleFilter.value;
        const matchesStatus = !statusFilter.value || user.etat === statusFilter.value;
        const searchLower = searchQuery.value.toLowerCase();
        const matchesSearch = !searchQuery.value || 
          user.nom.toLowerCase().includes(searchLower) ||
          user.prenom.toLowerCase().includes(searchLower) ||
          user.pseudo.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        
        return matchesRole && matchesStatus && matchesSearch;
      });
    });

    const getRoleBadgeClass = (role) => {
      const classes = {
        'Administrateur': 'bg-danger',
        'Caissier': 'bg-success',
        'Serveur': 'bg-primary',
        'Cuisinier': 'bg-warning text-dark'
      };
      return `badge ${classes[role] || 'bg-secondary'}`;
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        'Actif': 'bg-success',
        'Inactif': 'bg-secondary',
        'Connecté': 'bg-primary',
        'Déconnecté': 'bg-warning text-dark',
        'Suspendu': 'bg-danger'
      };
      return `badge ${classes[status] || 'bg-secondary'}`;
    };

    const formatDate = (date) => {
      if (!date) return 'Jamais';
      return new Date(date).toLocaleString();
    };

    const loadUsers = async () => {
      try {
        await store.dispatch('users/fetchUsers');
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    const saveUser = async (userData) => {
      try {
        if (editingUser.value) {
          await store.dispatch('users/updateUser', userData);
        } else {
          await store.dispatch('users/createUser', userData);
        }
        closeUserModal();
        loadUsers();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    };

    const editUser = (user) => {
      editingUser.value = { ...user };
      showAddUserModal.value = true;
    };

    const toggleUserStatus = async (user) => {
      const newStatus = user.etat === 'Actif' ? 'Inactif' : 'Actif';
      try {
        await store.dispatch('users/updateUserStatus', {
          userId: user.id,
          etat: newStatus
        });
        loadUsers();
      } catch (error) {
        console.error('Erreur lors du changement d\'état:', error);
      }
    };

    const resetAttempts = async (user) => {
      try {
        await store.dispatch('users/resetLoginAttempts', user.id);
        loadUsers();
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
      }
    };

    const confirmDelete = (user) => {
      userToDelete.value = user;
      showDeleteModal.value = true;
    };

    const deleteUser = async () => {
      if (!userToDelete.value) return;
      
      loading.value = true;
      try {
        await store.dispatch('users/deleteUser', userToDelete.value.id);
        showDeleteModal.value = false;
        loadUsers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        loading.value = false;
        userToDelete.value = null;
      }
    };

    const closeUserModal = () => {
      showAddUserModal.value = false;
      editingUser.value = null;
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      showAddUserModal,
      showDeleteModal,
      editingUser,
      loading,
      roleFilter,
      statusFilter,
      searchQuery,
      currentUser,
      filteredUsers,
      getRoleBadgeClass,
      getStatusBadgeClass,
      formatDate,
      saveUser,
      editUser,
      toggleUserStatus,
      resetAttempts,
      confirmDelete,
      deleteUser,
      closeUserModal
    };
  }
};
</script>

<style scoped>
.gestion-utilisateurs {
  padding: 20px;
}

.btn-group {
  gap: 5px;
}

.badge {
  font-size: 0.9em;
  padding: 0.5em 0.7em;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table th {
  white-space: nowrap;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.btn-group .btn {
  border-radius: 4px !important;
}
</style>
