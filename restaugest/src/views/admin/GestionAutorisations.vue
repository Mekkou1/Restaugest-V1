<template>
    <div class="gestion-autorisations">
      <div class="header-section">
        <h2>Gestion des Autorisations</h2>
      </div>
  
      <!-- Sélection du rôle -->
      <div class="role-selector">
        <div 
          v-for="role in roles"
          :key="role"
          class="role-card"
          :class="{ active: selectedRole === role }"
          @click="selectRole(role)"
        >
          <i :class="getRoleIcon(role)"></i>
          <span>{{ role }}</span>
        </div>
      </div>
  
      <!-- Matrice des permissions -->
      <div v-if="selectedRole" class="permissions-matrix">
        <div class="matrix-header">
          <h3>Permissions pour {{ selectedRole }}</h3>
          <div class="bulk-actions">
            <button 
              class="btn-secondary"
              @click="selectAll"
            >
              Tout sélectionner
            </button>
            <button 
              class="btn-secondary"
              @click="deselectAll"
            >
              Tout désélectionner
            </button>
          </div>
        </div>
  
        <div class="modules-grid">
          <!-- Module Administrateur -->
          <div class="module-section">
            <div class="module-header">
              <h4>Administration</h4>
              <label class="toggle-all">
                <input 
                  type="checkbox"
                  v-model="moduleStates.admin"
                  @change="toggleModule('admin')"
                >
                <span class="toggle-label">Tout</span>
              </label>
            </div>
            <div class="permissions-list">
              <div 
                v-for="perm in adminPermissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="permission-label">
                  <input 
                    type="checkbox"
                    v-model="permissions[perm.id]"
                    @change="updateModuleState('admin')"
                  >
                  <span>{{ perm.label }}</span>
                </label>
                <div class="sub-permissions" v-if="perm.subPermissions">
                  <label 
                    v-for="subPerm in perm.subPermissions"
                    :key="subPerm.id"
                    class="sub-permission-label"
                  >
                    <input 
                      type="checkbox"
                      v-model="permissions[subPerm.id]"
                      @change="updateModuleState('admin')"
                    >
                    <span>{{ subPerm.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Module Caisse -->
          <div class="module-section">
            <div class="module-header">
              <h4>Caisse</h4>
              <label class="toggle-all">
                <input 
                  type="checkbox"
                  v-model="moduleStates.caisse"
                  @change="toggleModule('caisse')"
                >
                <span class="toggle-label">Tout</span>
              </label>
            </div>
            <div class="permissions-list">
              <div 
                v-for="perm in caissePermissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="permission-label">
                  <input 
                    type="checkbox"
                    v-model="permissions[perm.id]"
                    @change="updateModuleState('caisse')"
                  >
                  <span>{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
  
          <!-- Module Serveur -->
          <div class="module-section">
            <div class="module-header">
              <h4>Service</h4>
              <label class="toggle-all">
                <input 
                  type="checkbox"
                  v-model="moduleStates.service"
                  @change="toggleModule('service')"
                >
                <span class="toggle-label">Tout</span>
              </label>
            </div>
            <div class="permissions-list">
              <div 
                v-for="perm in servicePermissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="permission-label">
                  <input 
                    type="checkbox"
                    v-model="permissions[perm.id]"
                    @change="updateModuleState('service')"
                  >
                  <span>{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
  
          <!-- Module Cuisine -->
          <div class="module-section">
            <div class="module-header">
              <h4>Cuisine</h4>
              <label class="toggle-all">
                <input 
                  type="checkbox"
                  v-model="moduleStates.cuisine"
                  @change="toggleModule('cuisine')"
                >
                <span class="toggle-label">Tout</span>
              </label>
            </div>
            <div class="permissions-list">
              <div 
                v-for="perm in cuisinePermissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="permission-label">
                  <input 
                    type="checkbox"
                    v-model="permissions[perm.id]"
                    @change="updateModuleState('cuisine')"
                  >
                  <span>{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
  
          <!-- Module Rapports -->
          <div class="module-section">
            <div class="module-header">
              <h4>Rapports</h4>
              <label class="toggle-all">
                <input 
                  type="checkbox"
                  v-model="moduleStates.rapports"
                  @change="toggleModule('rapports')"
                >
                <span class="toggle-label">Tout</span>
              </label>
            </div>
            <div class="permissions-list">
              <div 
                v-for="perm in rapportsPermissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="permission-label">
                  <input 
                    type="checkbox"
                    v-model="permissions[perm.id]"
                    @change="updateModuleState('rapports')"
                  >
                  <span>{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Actions -->
        <div class="actions-section">
          <button 
            class="btn-secondary"
            @click="resetPermissions"
          >
            Réinitialiser
          </button>
          <button 
            class="btn-primary"
            @click="savePermissions"
            :disabled="!hasChanges"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import api from '@/utils/api';
  
  export default {
    name: 'GestionAutorisations',
  
    setup() {
      const store = useStore();
  
      // État
      const roles = ['Administrateur', 'Gérant', 'Caissier', 'Serveur', 'Cuisinier'];
      const selectedRole = ref(null);
      const permissions = ref({});
      const originalPermissions = ref({});
      const moduleStates = ref({
        admin: false,
        caisse: false,
        service: false,
        cuisine: false,
        rapports: false
      });
  
      // Permissions par module
      const adminPermissions = [
        {
          id: 'users_manage',
          label: 'Gestion des utilisateurs',
          subPermissions: [
            { id: 'users_create', label: 'Créer' },
            { id: 'users_edit', label: 'Modifier' },
            { id: 'users_delete', label: 'Supprimer' }
          ]
        },
        {
          id: 'salles_manage',
          label: 'Gestion des salles',
          subPermissions: [
            { id: 'salles_create', label: 'Créer' },
            { id: 'salles_edit', label: 'Modifier' },
            { id: 'salles_delete', label: 'Supprimer' }
          ]
        },
        {
          id: 'tables_manage',
          label: 'Gestion des tables',
          subPermissions: [
            { id: 'tables_create', label: 'Créer' },
            { id: 'tables_edit', label: 'Modifier' },
            { id: 'tables_delete', label: 'Supprimer' }
          ]
        },
        {
          id: 'menu_manage',
          label: 'Gestion du menu',
          subPermissions: [
            { id: 'plats_manage', label: 'Plats' },
            { id: 'boissons_manage', label: 'Boissons' },
            { id: 'intrants_manage', label: 'Intrants' }
          ]
        },
        {
          id: 'carte_manage',
          label: 'Gestion des cartes',
          subPermissions: [
            { id: 'carte_create', label: 'Créer' },
            { id: 'carte_edit', label: 'Modifier' },
            { id: 'carte_delete', label: 'Supprimer' }
          ]
        },
        {
          id: 'stock_manage',
          label: 'Gestion des stocks',
          subPermissions: [
            { id: 'stock_view', label: 'Consulter' },
            { id: 'stock_adjust', label: 'Ajuster' },
            { id: 'stock_order', label: 'Commander' }
          ]
        }
      ];
  
      const caissePermissions = [
        { id: 'caisse_open', label: 'Ouvrir la caisse' },
        { id: 'caisse_close', label: 'Fermer la caisse' },
        { id: 'payments_manage', label: 'Gérer les paiements' },
        { id: 'tickets_manage', label: 'Gérer les tickets' },
        { id: 'avoirs_manage', label: 'Gérer les avoirs' },
        { id: 'transfers_manage', label: 'Gérer les transferts' },
        { id: 'billetage_manage', label: 'Gérer le billetage' }
      ];
  
      const servicePermissions = [
        { id: 'orders_create', label: 'Créer des commandes' },
        { id: 'orders_edit', label: 'Modifier des commandes' },
        { id: 'orders_cancel', label: 'Annuler des commandes' },
        { id: 'orders_serve', label: 'Servir des commandes' },
        { id: 'tables_view', label: 'Voir l\'état des tables' }
      ];
  
      const cuisinePermissions = [
        { id: 'kitchen_view', label: 'Voir les commandes' },
        { id: 'kitchen_prepare', label: 'Préparer les commandes' },
        { id: 'kitchen_complete', label: 'Terminer les commandes' },
        { id: 'kitchen_cancel', label: 'Annuler les préparations' }
      ];
  
      const rapportsPermissions = [
        { id: 'reports_sales', label: 'Rapports des ventes' },
        { id: 'reports_stock', label: 'Rapports des stocks' },
        { id: 'reports_staff', label: 'Rapports du personnel' },
        { id: 'reports_finance', label: 'Rapports financiers' },
        { id: 'reports_export', label: 'Exporter les rapports' }
      ];
  
      // Computed
      const hasChanges = computed(() => {
        return Object.keys(permissions.value).some(key => 
          permissions.value[key] !== originalPermissions.value[key]
        );
      });
  
      // Méthodes
      const selectRole = async (role) => {
        selectedRole.value = role;
        await loadPermissions(role);
      };
  
      const loadPermissions = async (role) => {
        try {
          const response = await api.get(`/permissions/${role}`);
          permissions.value = response.data;
          originalPermissions.value = { ...response.data };
          updateAllModuleStates();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des permissions'
          });
        }
      };
  
      const updateModuleState = (module) => {
        const modulePerms = getModulePermissions(module);
        moduleStates.value[module] = modulePerms.every(perm => 
          permissions.value[perm.id]
        );
      };
  
      const updateAllModuleStates = () => {
        Object.keys(moduleStates.value).forEach(module => {
          updateModuleState(module);
        });
      };
  
      const getModulePermissions = (module) => {
        switch (module) {
          case 'admin': return adminPermissions;
          case 'caisse': return caissePermissions;
          case 'service': return servicePermissions;
          case 'cuisine': return cuisinePermissions;
          case 'rapports': return rapportsPermissions;
          default: return [];
        }
      };
  
      const toggleModule = (module) => {
        const modulePerms = getModulePermissions(module);
        const newState = moduleStates.value[module];
        
        modulePerms.forEach(perm => {
          if (perm.subPermissions) {
            perm.subPermissions.forEach(subPerm => {
              permissions.value[subPerm.id] = newState;
            });
          }
          permissions.value[perm.id] = newState;
        });
      };
  
      const selectAll = () => {
        Object.keys(moduleStates.value).forEach(module => {
          moduleStates.value[module] = true;
          toggleModule(module);
        });
      };
  
      const deselectAll = () => {
        Object.keys(moduleStates.value).forEach(module => {
          moduleStates.value[module] = false;
          toggleModule(module);
        });
      };
  
      const resetPermissions = () => {
        permissions.value = { ...originalPermissions.value };
        updateAllModuleStates();
      };
  
      const savePermissions = async () => {
        try {
          await api.put(`/permissions/${selectedRole.value}`, {
            permissions: permissions.value
          });
  
          originalPermissions.value = { ...permissions.value };
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Permissions mises à jour avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la mise à jour des permissions'
          });
        }
      };
  
      const getRoleIcon = (role) => {
        const icons = {
          'Administrateur': 'fas fa-user-shield',
          'Gérant': 'fas fa-user-tie',
          'Caissier': 'fas fa-cash-register',
          'Serveur': 'fas fa-user-clock',
          'Cuisinier': 'fas fa-utensils'
        };
        return icons[role] || 'fas fa-user';
      };
  
      return {
        roles,
        selectedRole,
        permissions,
        moduleStates,
        adminPermissions,
        caissePermissions,
        servicePermissions,
        cuisinePermissions,
        rapportsPermissions,
        hasChanges,
        selectRole,
        updateModuleState,
        toggleModule,
        selectAll,
        deselectAll,
        resetPermissions,
        savePermissions,
        getRoleIcon
      };
    }
  };
  </script>
  
  <style scoped>
  .gestion-autorisations {
    padding: 2rem;
  }
  
  .header-section {
    margin-bottom: 2rem;
  }
  
  .role-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .role-card {
    padding: 1rem 2rem;
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
  }
  
  .role-card:hover {
    border-color: #ff6600;
    background: #fff5eb;
  }
  
  .role-card.active {
    border-color: #ff6600;
    background: #ff6600;
    color: white;
  }
  
  .permissions-matrix {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .matrix-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .bulk-actions {
    display: flex;
    gap: 1rem;
  }
  
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .module-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .module-header h4 {
    margin: 0;
  }
  
  .permissions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .permission-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .permission-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .sub-permissions {
    margin-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sub-permission-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #6c757d;
  }
  
  .toggle-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .toggle-label {
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .actions-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .gestion-autorisations {
      padding: 1rem;
    }
  
    .role-selector {
      flex-wrap: nowrap;
    }
  
    .modules-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>
  