<template>
  <DashboardLayout :title="'Module Administrateur'">

    <DashboardHeader :title="'Module Administrateur'" />
    <div class="container-fluid">
      <div class="row mb-4">
        <!-- Cartes de statistiques -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ventes Totales</h5>
              <p class="card-text amount">{{ statistiques.ventes }} FCFA</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Commandes</h5>
              <p class="card-text amount">{{ statistiques.commandes }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Revenus</h5>
              <p class="card-text amount">{{ statistiques.revenus }} FCFA</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Utilisateurs Actifs</h5>
              <p class="card-text amount">{{ utilisateurs.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestion des utilisateurs -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Gestion des utilisateurs</h5>
              <button class="btn btn-primary" @click="showAddUserModal = true">
                <i class="fas fa-plus"></i> Ajouter un utilisateur
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Pseudo</th>
                      <th>Rôle</th>
                      <th>État</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in utilisateurs" :key="user.id">
                      <td>{{ user.nom }}</td>
                      <td>{{ user.prenom }}</td>
                      <td>{{ user.pseudo }}</td>
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
                        <button class="btn btn-sm btn-primary me-2" @click="editUser(user)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="confirmDeleteUser(user)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Ajout/Modification Utilisateur -->
      <div class="modal" tabindex="-1" :class="{ 'd-block': showAddUserModal || editingUser }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
              </h5>
              <button type="button" class="btn-close" @click="closeUserModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveUser">
                <div class="mb-3">
                  <label class="form-label">Nom</label>
                  <input type="text" class="form-control" v-model="currentUser.nom" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Prénom</label>
                  <input type="text" class="form-control" v-model="currentUser.prenom" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Pseudo</label>
                  <input type="text" class="form-control" v-model="currentUser.pseudo" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Rôle</label>
                  <select class="form-select" v-model="currentUser.role" required>
                    <option v-if="isAdmin" value="Administrateur">Administrateur</option>
                    <option value="Gérant">Gérant</option>
                    <option value="Caissier">Caissier</option>
                    <option value="Serveur">Serveur</option>
                    <option value="Cuisinier">Cuisinier</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Mot de passe</label>
                  <input type="password" class="form-control" v-model="currentUser.password"
                         :required="!editingUser">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeUserModal">
                    Annuler
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
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
              <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
                Annuler
              </button>
              <button type="button" class="btn btn-danger" @click="deleteUser" :disabled="deleting">
                {{ deleting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/api'

export default {
  name: 'AdminVue',
  components: {
    DashboardLayout,
    DashboardHeader
  },
  setup() {
    const utilisateurs = ref([]);
    const statistiques = ref({
      ventes: 0,
      commandes: 0,
      revenus: 0
    });
    const showAddUserModal = ref(false);
    const showDeleteModal = ref(false);
    const editingUser = ref(null);
    const currentUser = ref({
      nom: '',
      prenom: '',
      pseudo: '',
      role: '',
      password: ''
    });
    const saving = ref(false);
    const deleting = ref(false);
    const userToDelete = ref(null);

    const menuItems = [
      { name: 'dashboard', label: 'Tableau de bord', path: '/admin', icon: 'fas fa-tachometer-alt' },
      { name: 'users', label: 'Utilisateurs', path: '/admin/users', icon: 'fas fa-users' },
      { name: 'menu', label: 'Menu', path: '/admin/menu', icon: 'fas fa-utensils' },
      { name: 'stock', label: 'Stock', path: '/admin/stock', icon: 'fas fa-boxes' },
      { name: 'sales', label: 'Ventes', path: '/admin/sales', icon: 'fas fa-chart-line' },
      { name: 'settings', label: 'Paramètres', path: '/admin/settings', icon: 'fas fa-cog' }
    ];

    const isAdmin = computed(() => {
      return localStorage.getItem('role') === 'Administrateur';
    });

    const fetchUsers = async () => {
      console.log('Fetching users...');
      try {
        const response = await api.get('admin/users');
        console.log('Users fetched successfully:', response.data);
        utilisateurs.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    const fetchStats = async () => {
      console.log('Fetching statistics...');
      try {
        const response = await api.get('admin/statistics');
        statistiques.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    const saveUser = async () => {
      saving.value = true;
      try {
        if (editingUser.value) {
          await api.put(`/admin/users/${editingUser.value.id}`, currentUser.value);
        } else {
          await api.post('/admin/users', currentUser.value);
        }
        await fetchUsers();
        closeUserModal();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        saving.value = false;
      }
    };

    const deleteUser = async () => {
      if (!userToDelete.value) return;

      deleting.value = true;
      try {
        await api.delete(`/admin/users/${userToDelete.value.id}`);
        await fetchUsers();
        showDeleteModal.value = false;
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        deleting.value = false;
        userToDelete.value = null;
      }
    };

    const editUser = (user) => {
      editingUser.value = user;
      currentUser.value = { ...user };
      currentUser.value.password = '';
      showAddUserModal.value = true;
    };

    const confirmDeleteUser = (user) => {
      userToDelete.value = user;
      showDeleteModal.value = true;
    };

    const closeUserModal = () => {
      showAddUserModal.value = false;
      editingUser.value = null;
      currentUser.value = {
        nom: '',
        prenom: '',
        pseudo: '',
        role: '',
        password: ''
      };
    };

    onMounted(() => {
      fetchUsers();
      fetchStats();
    });

    return {
      utilisateurs,
      statistiques,
      menuItems,
      showAddUserModal,
      showDeleteModal,
      editingUser,
      currentUser,
      saving,
      deleting,
      isAdmin,
      saveUser,
      deleteUser,
      editUser,
      confirmDeleteUser,
      closeUserModal
    };
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.card-title {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6600;
}
</style>
