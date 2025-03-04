<template>
  <div class="dashboard-wrapper">
    <header class="header-admin d-flex justify-content-between align-items-center p-3 bg-dark text-white">
      <div class="d-flex align-items-center">
        <img src="../assets/Logo.png" alt="Logo" class="logo me-2">
        <div class="user-info">
          <h5 class="mb-0">{{ currentUser?.pseudo }}</h5>
          <small>{{ currentUser?.role }}</small>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <div class="date-heure me-4">
          <div>{{ currentDate }}</div>
          <div>{{ currentTime }}</div>
        </div>
        <button @click="handleLogout" class="btn btn-outline-light">
          <i class="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
    </header>

    <div class="dashboard-container">
      <aside class="sidebar bg-light p-3">
        <nav>
          <ul class="list-unstyled">
            <!-- Menu pour Administrateur -->
            <template v-if="isAdmin">
              <li class="menu-section">
                <h6 class="text-uppercase mb-3">Administration</h6>
                <ul class="list-unstyled ps-3">
                  <li>
                    <router-link to="/dashboard/admin/users" class="menu-item">
                      <i class="fas fa-users"></i>
                      Utilisateurs
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/dashboard/admin/salles" class="menu-item">
                      <i class="fas fa-door-open"></i>
                      Salles
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/dashboard/admin/menu" class="menu-item">
                      <i class="fas fa-utensils"></i>
                      Menu
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/dashboard/admin/stats" class="menu-item">
                      <i class="fas fa-chart-bar"></i>
                      Statistiques
                    </router-link>
                  </li>
                </ul>
              </li>
            </template>

            <!-- Menu pour Caissier -->
            <template v-if="isCaissier">
              <li class="menu-section">
                <h6 class="text-uppercase mb-3">Caisse</h6>
                <ul class="list-unstyled ps-3">
                  <li>
                    <router-link to="/dashboard/caisse/tickets" class="menu-item">
                      <i class="fas fa-receipt"></i>
                      Tickets
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/dashboard/caisse/paiements" class="menu-item">
                      <i class="fas fa-cash-register"></i>
                      Paiements
                    </router-link>
                  </li>
                </ul>
              </li>
            </template>

            <!-- Menu pour Serveur -->
            <template v-if="isServeur">
              <li class="menu-section">
                <h6 class="text-uppercase mb-3">Service</h6>
                <ul class="list-unstyled ps-3">
                  <li>
                    <router-link to="/dashboard/serveur/commandes" class="menu-item">
                      <i class="fas fa-clipboard-list"></i>
                      Commandes
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/dashboard/serveur/tables" class="menu-item">
                      <i class="fas fa-chair"></i>
                      Tables
                    </router-link>
                  </li>
                </ul>
              </li>
            </template>

            <!-- Menu pour Cuisinier -->
            <template v-if="isCuisinier">
              <li class="menu-section">
                <h6 class="text-uppercase mb-3">Cuisine</h6>
                <ul class="list-unstyled ps-3">
                  <li>
                    <router-link to="/dashboard/cuisine/commandes" class="menu-item">
                      <i class="fas fa-utensils"></i>
                      Commandes
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/dashboard/cuisine/stock" class="menu-item">
                      <i class="fas fa-warehouse"></i>
                      Stock
                    </router-link>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </nav>
      </aside>

      <main class="main-content p-4">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'DashboardLayout',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Time management
    const currentDate = ref(new Date().toLocaleDateString());
    const currentTime = ref(new Date().toLocaleTimeString());
    let timer = null;

    // Computed properties
    const currentUser = computed(() => store.state.auth.user);
    const isAdmin = computed(() => currentUser.value?.role === 'Administrateur');
    const isCaissier = computed(() => currentUser.value?.role === 'Caissier');
    const isServeur = computed(() => currentUser.value?.role === 'Serveur');
    const isCuisinier = computed(() => currentUser.value?.role === 'Cuisinier');

    // Methods
    const updateTime = () => {
      currentDate.value = new Date().toLocaleDateString();
      currentTime.value = new Date().toLocaleTimeString();
    };

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      // Start timer
      timer = setInterval(updateTime, 1000);

      // Check authentication
      if (!store.getters['auth/isAuthenticated']) {
        router.push('/login');
      }
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return {
      currentUser,
      currentDate,
      currentTime,
      isAdmin,
      isCaissier,
      isServeur,
      isCuisinier,
      handleLogout
    };
  }
};
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-admin {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
}

.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.dashboard-container {
  flex: 1;
  display: flex;
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  min-height: calc(100vh - 64px);
  border-right: 1px solid #dee2e6;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.menu-section {
  margin-bottom: 2rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #495057;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #ff6600;
}

.menu-item.router-link-active {
  background-color: #ff6600;
  color: white;
}

.menu-item i {
  width: 20px;
  margin-right: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -250px;
    top: 64px;
    bottom: 0;
    transition: left 0.3s ease;
    background: white;
    z-index: 1000;
  }

  .sidebar.active {
    left: 0;
  }

  .main-content {
    margin-left: 0;
  }
}

.date-heure {
  text-align: right;
  font-size: 0.9rem;
}

.user-info small {
  color: #adb5bd;
}

.btn-outline-light:hover {
  background-color: rgba(255,255,255,0.1);
}
</style>
