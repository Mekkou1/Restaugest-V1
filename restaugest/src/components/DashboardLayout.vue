<template>
  <div class="dashboard-wrapper">
    <header class="header-admin d-flex justify-content-between align-items-center p-3 bg-dark text-white">
      <div class="d-flex align-items-center">
        <img src="../assets/Logo.png" alt="Logo" class="logo me-2">
        <div class="user-info">
          <h5 class="mb-0">{{ userName }}</h5>
          <small>{{ userRole }}</small>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <div class="date-heure me-4">
          <div>{{ date }}</div>
          <div>{{ heure }}</div>
        </div>
        <button @click="logout" class="btn btn-outline-light">
          <i class="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
    </header>

    <div class="dashboard-container">
      <aside class="sidebar bg-light p-3 d-flex flex-column h-100">
        <nav class="flex-grow-1">
          <ul class="list-unstyled">
            <template v-if="userRole === 'Caissier'">
              <li class="mb-2" @click="toggleGroup('gestion')">
                <strong>Gestion des commandes</strong>
              </li>
              <ul v-if="menuOuvert.gestion" class="list-unstyled ms-3">
                <li class="mb-3 d-flex align-items-center" @click="afficherSection('tickets')">
                  <img src="../assets/Tickets.jpg" alt="Tickets" class="me-2" style="width: 30px; height: 30px;">
                  <span>Tickets</span>
                </li>
              </ul>
              <li class="mb-2" @click="toggleGroup('finances')">
                <strong>Finances</strong>
              </li>
              <ul v-if="menuOuvert.finances" class="list-unstyled ms-3">
                <li class="mb-3 d-flex align-items-center" @click="afficherSection('payement')">
                  <img src="../assets/Caisse.jpg" alt="Paiement" class="me-2" style="width: 30px; height: 30px;">
                  <span>Paiement</span>
                </li>
                <li class="mb-3 d-flex align-items-center" @click="afficherSection('fonds')">
                  <img src="../assets/Fonds1.jpg" alt="Fonds" class="me-2" style="width: 30px; height: 30px;">
                  <span>Fonds</span>
                </li>
              </ul>
            </template>

            <template v-if="userRole === 'Administrateur'">
              <li class="mb-2" @click="toggleGroup('admin')">
                <strong>Administration</strong>
              </li>
              <ul v-if="menuOuvert.admin" class="list-unstyled ms-3">
                <li class="mb-3 d-flex align-items-center" @click="afficherSection('users')">
                  <i class="fas fa-users me-2"></i>
                  <span>Utilisateurs</span>
                </li>
                <li class="mb-3 d-flex align-items-center" @click="afficherSection('settings')">
                  <i class="fas fa-cog me-2"></i>
                  <span>Paramètres</span>
                </li>
              </ul>
            </template>
          </ul>
        </nav>
      </aside>

      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DashboardLayout',
  data() {
    return {
      date: new Date().toLocaleDateString(),
      heure: new Date().toLocaleTimeString(),
      timer: null,
      menuOuvert: {
        gestion: false,
        finances: false,
        admin: false
      }
    };
  },
  computed: {
    ...mapState({
      user: state => state.user || {}
    }),
    userName() {
      return this.user?.pseudo || '';
    },
    userRole() {
      return this.user?.role || '';
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    toggleGroup(group) {
      this.menuOuvert = { ...this.menuOuvert, [group]: !this.menuOuvert[group] };
    },
    afficherSection(path) {
      this.$router.push(`/dashboard/${path}`);
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    updateTime() {
      this.date = new Date().toLocaleDateString();
      this.heure = new Date().toLocaleTimeString();
    }
  },
  mounted() {
    console.group('DashboardLayout Mounted');
    console.log('Is authenticated:', this.isAuthenticated);
    console.log('User:', this.user);
    console.log('Current route:', this.$route.path);
    
    this.timer = setInterval(this.updateTime, 1000);
    
    if (!this.isAuthenticated) {
      console.warn('User not authenticated, redirecting to login');
      this.$router.push('/login');
    } else {
      console.log('DashboardLayout mounted successfully');
    }
    console.groupEnd();
  },

  beforeUnmount() {
    console.log('DashboardLayout unmounting');
    clearInterval(this.timer);
  },
  
  created() {
    console.group('DashboardLayout Created');
    console.log('Initial user:', this.user);
    console.log('Is authenticated:', this.isAuthenticated);
    console.groupEnd();
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
  position: relative; /* Ensure the modal is positioned correctly */
}

.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.user-info {
  margin-left: 1rem;
}

.date-heure {
  text-align: right;
  font-size: 0.9rem;
}

.btn-outline-light {
  border-width: 2px;
}

.btn-outline-light:hover {
  background-color: rgba(255,255,255,0.1);
}

small {
  color: #adb5bd;
  font-size: 0.8rem;
}

.dashboard-container {
  flex: 1;
  display: flex;
  background-color: #f4f6f9;
}

.sidebar {
  width: 250px;
  background-color: white;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  padding: 1rem;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.menu-item i {
  margin-right: 0.5rem;
}

.menu-item:hover {
  background-color: #f8f9fa;
  color: #ff6600;
}

.menu-item.active {
  background-color: #ff6600;
  color: white;
}

.session-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.session-warning-modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  background: #ff6600;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

aside {
  width: 200px;
  height: 100vh;
}
nav ul li {
  cursor: pointer;
  user-select: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    margin-bottom: 1rem;
  }

  .menu-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .menu-item {
    white-space: nowrap;
  }
}
</style>
