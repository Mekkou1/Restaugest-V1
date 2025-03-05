<template>
  <header class="dashboard-header">
    <div class="header-left">
      <button class="menu-toggle" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="branding">
        <img src="../assets/Logo.png" alt="Logo" class="logo">
        <h1 class="app-title">Restaugest</h1>
      </div>
    </div>

    <div class="header-right">
      <!-- Date and Time -->
      <div class="datetime">
        <div class="date">{{ currentDate }}</div>
        <div class="time">{{ currentTime }}</div>
      </div>

      <!-- User Menu -->
      <div class="user-menu">
        <div class="dropdown">
          <button 
            class="user-button" 
            type="button" 
            id="userMenu" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <div class="user-info">
              <span class="user-name">{{ currentUser?.pseudo }}</span>
              <small class="user-role">{{ currentUser?.role }}</small>
            </div>
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
              <span 
                class="status-indicator"
                :class="{ 'active': currentUser?.etat === 'Connecté' }"
              ></span>
            </div>
          </button>

          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
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
                <small>Expire dans:</small><br>
                {{ sessionTimeRemaining }}
              </span>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a 
                class="dropdown-item" 
                href="#" 
                @click.prevent="refreshSession"
                :class="{ 'disabled': refreshing }"
              >
                <i class="fas fa-sync-alt me-2"></i>
                <span v-if="!refreshing">Prolonger la session</span>
                <span v-else>Prolongation en cours...</span>
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a 
                class="dropdown-item text-danger" 
                href="#" 
                @click.prevent="handleLogout"
              >
                <i class="fas fa-sign-out-alt me-2"></i>
                Déconnexion
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { sessionManager } from '../utils/session';

export default {
  name: 'DashboardHeader',

  setup() {
    const store = useStore();
    const router = useRouter();
    const currentDate = ref(new Date().toLocaleDateString());
    const currentTime = ref(new Date().toLocaleTimeString());
    const refreshing = ref(false);
    let clockInterval = null;

    const currentUser = computed(() => store.getters['auth/getUser']);
    const currentSession = computed(() => store.getters['auth/getSession']);

    const sessionTimeRemaining = computed(() => {
      return sessionManager.formatRemainingTime();
    });

    const updateDateTime = () => {
      const now = new Date();
      currentDate.value = now.toLocaleDateString();
      currentTime.value = now.toLocaleTimeString();
    };

    const formatDate = (date) => {
      if (!date) return 'Jamais';
      return new Date(date).toLocaleString();
    };

    const refreshSession = async () => {
      refreshing.value = true;
      try {
        await store.dispatch('auth/refreshSession');
      } catch (error) {
        console.error('Session refresh failed:', error);
      } finally {
        refreshing.value = false;
      }
    };

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    onMounted(() => {
      updateDateTime();
      clockInterval = setInterval(updateDateTime, 1000);
    });

    onUnmounted(() => {
      if (clockInterval) {
        clearInterval(clockInterval);
      }
    });

    return {
      currentUser,
      currentSession,
      currentDate,
      currentTime,
      sessionTimeRemaining,
      refreshing,
      formatDate,
      refreshSession,
      handleLogout
    };
  }
};
</script>

<style scoped>
.dashboard-header {
  background-color: var(--dark-color);
  color: white;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 64px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.menu-toggle:hover {
  color: var(--primary-color);
}

.branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
}

.app-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.datetime {
  text-align: right;
  line-height: 1.2;
}

.date {
  font-size: 0.9rem;
  color: #adb5bd;
}

.time {
  font-size: 1.1rem;
  font-weight: 500;
}

.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  cursor: pointer;
}

.user-info {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  font-weight: 500;
  display: block;
}

.user-role {
  color: #adb5bd;
  font-size: 0.8rem;
}

.user-avatar {
  position: relative;
  font-size: 2rem;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #6c757d;
  border: 2px solid var(--dark-color);
}

.status-indicator.active {
  background-color: #28a745;
}

.dropdown-menu {
  min-width: 250px;
  padding: 0.5rem;
}

.dropdown-header {
  color: var(--primary-color);
  font-weight: 600;
}

.dropdown-item-text {
  padding: 0.5rem 1rem;
}

.dropdown-item-text small {
  color: #6c757d;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .app-title {
    display: none;
  }

  .datetime {
    display: none;
  }

  .user-name,
  .user-role {
    display: none;
  }
}
</style>
