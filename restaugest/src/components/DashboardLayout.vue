<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardHeader />
    <main class="py-6">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <slot></slot>
      </div>
    </main>
    <NotificationWebsocket />
      <div class="d-flex align-items-center">
        <button class="btn btn-link text-white me-3" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
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
        <div class="dropdown me-3">
          <button class="btn btn-outline-light dropdown-toggle" type="button" id="sessionMenu" data-bs-toggle="dropdown">
            <i class="fas fa-user-circle"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="sessionMenu">
            <li class="dropdown-header">Session</li>
            <li>
              <span class="dropdown-item-text">
                <small>Dernière connexion:</small><br>
                {{ formatDate(currentUser?.derniere_connexion) }}
              </span>
            </li>
            <li>
              <span class="dropdown-item-text">
                <small>IP:</small><br>
                {{ currentSession?.ip_address }}
              </span>
            </li>
            <li>
              <span class="dropdown-item-text">
                <small>Expire le:</small><br>
                {{ formatDate(currentSession?.expires_at) }}
              </span>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="refreshSession">
                <i class="fas fa-sync-alt me-2"></i>
                Prolonger la session
              </a>
            </li>
          </ul>
        </div>
        <button @click="handleLogout" class="btn btn-outline-light">
          <i class="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
    </header>

    <div class="dashboard-container">
      <aside class="sidebar bg-light p-3" :class="{ 'active': sidebarOpen }">
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

      <main class="main-content p-4" :class="{ 'sidebar-open': sidebarOpen }">
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
    const sidebarOpen = ref(window.innerWidth >= 768);
    
    // Time management
    const currentDate = ref(new Date().toLocaleDateString());
    const currentTime = ref(new Date().toLocaleTimeString());
    let timer = null;

    // Computed properties
    const currentUser = computed(() => store.state.auth.user);
    const currentSession = computed(() => store.state.auth.session);
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

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    const formatDate = (date) => {
      if (!date) return 'Jamais';
      return new Date(date).toLocaleString();
    };

    const refreshSession = async () => {
      try {
        await store.dispatch('auth/refreshSession');
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        sidebarOpen.value = true;
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

      // Add resize listener
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    });

    return {
      currentUser,
      currentSession,
      currentDate,
      currentTime,
      sidebarOpen,
      isAdmin,
      isCaissier,
      isServeur,
      isCuisinier,
      handleLogout,
      toggleSidebar,
      formatDate,
      refreshSession
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
  transition: all 0.3s ease;
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  z-index: 999;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
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
@media (max-width: 767px) {
  .sidebar {
    left: -250px;
  }

  .sidebar.active {
    left: 0;
  }

  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-open {
    margin-left: 250px;
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

.dropdown-menu {
  min-width: 250px;
}

.dropdown-item-text {
  padding: 0.5rem 1rem;
}

.dropdown-item-text small {
  color: #6c757d;
}
</style>
