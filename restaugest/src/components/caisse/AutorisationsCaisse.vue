<template>
    <div class="autorisations-caisse">
      <div class="header-section">
        <h2>Autorisations de caisse</h2>
        <button 
          class="btn btn-primary"
          @click="sauvegarderAutorisations"
          :disabled="!hasChanges"
        >
          <i class="fas fa-save"></i>
          Enregistrer les modifications
        </button>
      </div>
  
      <!-- Sélection du rôle -->
      <div class="role-selector">
        <div 
          v-for="role in roles"
          :key="role.id"
          class="role-btn"
          :class="{ active: selectedRole?.id === role.id }"
          @click="selectRole(role)"
        >
          <i :class="getRoleIcon(role.code)"></i>
          <span>{{ role.nom }}</span>
        </div>
      </div>
  
      <!-- Grille des autorisations -->
      <div v-if="selectedRole" class="permissions-grid">
        <!-- Opérations de base -->
        <div class="permission-card">
          <div class="card-header">
            <h3>Opérations de base</h3>
            <div class="header-actions">
              <button 
                class="btn-icon"
                @click="toggleAllSection('base')"
                :title="allSectionEnabled('base') ? 'Tout désactiver' : 'Tout activer'"
              >
                <i :class="allSectionEnabled('base') ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
              </button>
            </div>
          </div>
          <div class="permissions-list">
            <div 
              v-for="perm in basePermissions"
              :key="perm.code"
              class="permission-item"
            >
              <div class="permission-info">
                <span class="permission-name">{{ perm.nom }}</span>
                <small class="permission-desc">{{ perm.description }}</small>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox"
                  v-model="selectedRole.permissions[perm.code]"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
  
        <!-- Opérations financières -->
        <div class="permission-card">
          <div class="card-header">
            <h3>Opérations financières</h3>
            <div class="header-actions">
              <button 
                class="btn-icon"
                @click="toggleAllSection('finance')"
                :title="allSectionEnabled('finance') ? 'Tout désactiver' : 'Tout activer'"
              >
                <i :class="allSectionEnabled('finance') ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
              </button>
            </div>
          </div>
          <div class="permissions-list">
            <div 
              v-for="perm in financePermissions"
              :key="perm.code"
              class="permission-item"
            >
              <div class="permission-info">
                <span class="permission-name">{{ perm.nom }}</span>
                <small class="permission-desc">{{ perm.description }}</small>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox"
                  v-model="selectedRole.permissions[perm.code]"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
  
        <!-- Administration -->
        <div class="permission-card">
          <div class="card-header">
            <h3>Administration</h3>
            <div class="header-actions">
              <button 
                class="btn-icon"
                @click="toggleAllSection('admin')"
                :title="allSectionEnabled('admin') ? 'Tout désactiver' : 'Tout activer'"
              >
                <i :class="allSectionEnabled('admin') ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
              </button>
            </div>
          </div>
          <div class="permissions-list">
            <div 
              v-for="perm in adminPermissions"
              :key="perm.code"
              class="permission-item"
            >
              <div class="permission-info">
                <span class="permission-name">{{ perm.nom }}</span>
                <small class="permission-desc">{{ perm.description }}</small>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox"
                  v-model="selectedRole.permissions[perm.code]"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
  
        <!-- Limites et seuils -->
        <div class="permission-card">
          <div class="card-header">
            <h3>Limites et seuils</h3>
          </div>
          <div class="limits-list">
            <div class="limit-item">
              <div class="limit-info">
                <span class="limit-name">Montant maximum par transaction</span>
                <small class="limit-desc">Limite le montant des transactions autorisées</small>
              </div>
              <div class="limit-value">
                <input 
                  type="number" 
                  v-model.number="selectedRole.limites.montant_max"
                  class="form-control"
                  min="0"
                >
              </div>
            </div>
  
            <div class="limit-item">
              <div class="limit-info">
                <span class="limit-name">Remise maximum autorisée (%)</span>
                <small class="limit-desc">Pourcentage maximum de remise applicable</small>
              </div>
              <div class="limit-value">
                <input 
                  type="number" 
                  v-model.number="selectedRole.limites.remise_max"
                  class="form-control"
                  min="0"
                  max="100"
                >
              </div>
            </div>
  
            <div class="limit-item">
              <div class="limit-info">
                <span class="limit-name">Nombre maximum d'annulations par jour</span>
                <small class="limit-desc">Limite les annulations de tickets</small>
              </div>
              <div class="limit-value">
                <input 
                  type="number" 
                  v-model.number="selectedRole.limites.annulations_max"
                  class="form-control"
                  min="0"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Message si aucun rôle sélectionné -->
      <div v-else class="no-selection">
        <i class="fas fa-user-shield"></i>
        <p>Sélectionnez un rôle pour configurer ses autorisations</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import api from '@/utils/api';
  
  export default {
    name: 'AutorisationsCaisse',
  
    setup() {
      const store = useStore();
  
      // État
      const roles = ref([]);
      const selectedRole = ref(null);
      const originalRoles = ref(null);
  
      // Permissions prédéfinies
      const basePermissions = [
        {
          code: 'CAISSE_OUVRIR',
          nom: 'Ouvrir la caisse',
          description: 'Autoriser l\'ouverture de la caisse en début de service'
        },
        {
          code: 'CAISSE_FERMER',
          nom: 'Fermer la caisse',
          description: 'Autoriser la fermeture de la caisse en fin de service'
        },
        {
          code: 'TICKET_CREER',
          nom: 'Créer des tickets',
          description: 'Autoriser la création de nouveaux tickets'
        },
        {
          code: 'TICKET_MODIFIER',
          nom: 'Modifier les tickets',
          description: 'Autoriser la modification des tickets existants'
        },
        {
          code: 'TICKET_ANNULER',
          nom: 'Annuler les tickets',
          description: 'Autoriser l\'annulation des tickets'
        }
      ];
  
      const financePermissions = [
        {
          code: 'PAIEMENT_ENCAISSER',
          nom: 'Encaisser les paiements',
          description: 'Autoriser l\'encaissement des paiements'
        },
        {
          code: 'REMISE_APPLIQUER',
          nom: 'Appliquer des remises',
          description: 'Autoriser l\'application de remises sur les tickets'
        },
        {
          code: 'AVOIR_CREER',
          nom: 'Créer des avoirs',
          description: 'Autoriser la création d\'avoirs'
        },
        {
          code: 'AVOIR_UTILISER',
          nom: 'Utiliser les avoirs',
          description: 'Autoriser l\'utilisation des avoirs existants'
        },
        {
          code: 'TRANSFERT_EFFECTUER',
          nom: 'Effectuer des transferts',
          description: 'Autoriser les transferts entre caisses'
        }
      ];
  
      const adminPermissions = [
        {
          code: 'CONFIG_MODIFIER',
          nom: 'Modifier la configuration',
          description: 'Autoriser la modification des paramètres de caisse'
        },
        {
          code: 'RAPPORT_CONSULTER',
          nom: 'Consulter les rapports',
          description: 'Autoriser l\'accès aux rapports de caisse'
        },
        {
          code: 'STATS_CONSULTER',
          nom: 'Consulter les statistiques',
          description: 'Autoriser l\'accès aux statistiques'
        },
        {
          code: 'UTILISATEUR_GERER',
          nom: 'Gérer les utilisateurs',
          description: 'Autoriser la gestion des utilisateurs de caisse'
        }
      ];
  
      // Computed
      const hasChanges = computed(() => {
        return JSON.stringify(roles.value) !== JSON.stringify(originalRoles.value);
      });
  
      // Méthodes
      const loadRoles = async () => {
        try {
          const response = await api.get('/roles/caisse');
          roles.value = response.data;
          originalRoles.value = JSON.parse(JSON.stringify(response.data));
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des rôles'
          });
        }
      };
  
      const selectRole = (role) => {
        selectedRole.value = role;
      };
  
      const sauvegarderAutorisations = async () => {
        try {
          await api.put('/roles/caisse', roles.value);
          originalRoles.value = JSON.parse(JSON.stringify(roles.value));
          
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Autorisations enregistrées avec succès'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement des autorisations'
          });
        }
      };
  
      const getRoleIcon = (code) => {
        const icons = {
          'ADMIN': 'fas fa-user-shield',
          'MANAGER': 'fas fa-user-tie',
          'CAISSIER': 'fas fa-user'
        };
        return icons[code] || 'fas fa-user';
      };
  
      const toggleAllSection = (section) => {
        const permissions = {
          base: basePermissions,
          finance: financePermissions,
          admin: adminPermissions
        }[section];
  
        const allEnabled = allSectionEnabled(section);
        
        permissions.forEach(perm => {
          selectedRole.value.permissions[perm.code] = !allEnabled;
        });
      };
  
      const allSectionEnabled = (section) => {
        const permissions = {
          base: basePermissions,
          finance: financePermissions,
          admin: adminPermissions
        }[section];
  
        return permissions.every(perm => 
          selectedRole.value?.permissions[perm.code]
        );
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadRoles();
      });
  
      return {
        roles,
        selectedRole,
        basePermissions,
        financePermissions,
        adminPermissions,
        hasChanges,
        selectRole,
        sauvegarderAutorisations,
        getRoleIcon,
        toggleAllSection,
        allSectionEnabled
      };
    }
  };
  </script>
  
  <style scoped>
  .autorisations-caisse {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .role-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .role-btn {
    padding: 1rem 2rem;
    border: 2px solid #dee2e6;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 200px;
    transition: all 0.3s ease;
  }
  
  .role-btn:hover {
    border-color: #ff6600;
  }
  
  .role-btn.active {
    border-color: #ff6600;
    background: #fff5eb;
  }
  
  .role-btn i {
    font-size: 1.5rem;
    color: #ff6600;
  }
  
  .permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .permission-card {
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
  
  .permissions-list,
  .limits-list {
    padding: 1.5rem;
  }
  
  .permission-item,
  .limit-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #dee2e6;
  }
  
  .permission-item:last-child,
  .limit-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .permission-info,
  .limit-info {
    flex: 1;
    padding-right: 1rem;
  }
  
  .permission-name,
  .limit-name {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .permission-desc,
  .limit-desc {
    display: block;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }
  
  .toggle-switch input {
    display: none;
  }
  
  .slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #dee2e6;
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .slider:before {
    content: '';
    position: absolute;
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  input:checked + .slider {
    background-color: #ff6600;
  }
  
  input:checked + .slider:before {
    transform: translateX(24px);
  }
  
  .limit-value {
    width: 150px;
  }
  
  .form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    text-align: right;
  }
  
  .no-selection {
    text-align: center;
    padding: 4rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .no-selection i {
    font-size: 3rem;
    color: #dee2e6;
    margin-bottom: 1rem;
  }
  
  .no-selection p {
    color: #6c757d;
    margin: 0;
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
  
  .btn-icon {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .autorisations-caisse {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .role-selector {
      flex-wrap: nowrap;
      overflow-x: auto;
      margin: -1rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }
  
    .role-btn {
      min-width: 150px;
    }
  
    .permissions-grid {
      grid-template-columns: 1fr;
    }
  
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>
  