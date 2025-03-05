<template>
  <div id="app">
    <router-view></router-view>

    <!-- Session Expiration Alert -->
    <div 
      class="session-alert" 
      :class="{ 'show': showSessionAlert }"
      v-if="isAuthenticated"
    >
      <div class="alert alert-warning" role="alert">
        <i class="fas fa-clock me-2"></i>
        Votre session expire bientôt
        <button 
          class="btn btn-sm btn-warning ms-3"
          @click="refreshSession"
          :disabled="refreshing"
        >
          <span v-if="refreshing" class="spinner-border spinner-border-sm me-1"></span>
          Prolonger la session
        </button>
      </div>
    </div>

    <!-- Global Loading Overlay -->
    <div class="loading-overlay" v-if="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import sessionManager from './utils/session';

export default {
  name: 'App',

  setup() {
    const store = useStore();
    const router = useRouter();
    const showSessionAlert = ref(false);
    const refreshing = ref(false);

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const loading = computed(() => store.state.loading);

    // Check session status periodically
    const checkSessionStatus = () => {
      if (isAuthenticated.value && sessionManager.isAboutToExpire()) {
        showSessionAlert.value = true;
      } else {
        showSessionAlert.value = false;
      }
    };

    // Refresh session
    const refreshSession = async () => {
      refreshing.value = true;
      try {
        await store.dispatch('auth/refreshSession');
        showSessionAlert.value = false;
      } catch (error) {
        console.error('Session refresh failed:', error);
        // If refresh fails, redirect to login
        router.push({ 
          name: 'Login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
      } finally {
        refreshing.value = false;
      }
    };

    // Initialize session monitoring
    onMounted(async () => {
      // Check authentication status
      if (localStorage.getItem('token')) {
        try {
          await store.dispatch('auth/checkAuth');
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }

      // Start session monitoring if authenticated
      if (isAuthenticated.value) {
        sessionManager.startMonitoring();
      }

      // Start session status check interval
      const interval = setInterval(checkSessionStatus, 60000); // Check every minute

      // Cleanup on unmount
      onUnmounted(() => {
        clearInterval(interval);
        sessionManager.stopMonitoring();
      });
    });

    return {
      isAuthenticated,
      loading,
      showSessionAlert,
      refreshing,
      refreshSession
    };
  }
};
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

.session-alert {
  position: fixed;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1050;
  transition: bottom 0.3s ease-in-out;
  min-width: 300px;
}

.session-alert.show {
  bottom: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-overlay .spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Global styles */
.btn-primary {
  background-color: #ff6600;
  border-color: #ff6600;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #ff8533;
  border-color: #ff8533;
}

.btn-outline-primary {
  color: #ff6600;
  border-color: #ff6600;
}

.btn-outline-primary:hover,
.btn-outline-primary:focus {
  background-color: #ff6600;
  border-color: #ff6600;
}

.text-primary {
  color: #ff6600 !important;
}

.bg-primary {
  background-color: #ff6600 !important;
}

/* Form styles */
.form-control:focus,
.form-select:focus {
  border-color: #ff6600;
  box-shadow: 0 0 0 0.2rem rgba(255, 102, 0, 0.25);
}

/* Table styles */
.table th {
  background-color: #343a40;
  color: white;
}

/* Card styles */
.card {
  border: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

/* Badge styles */
.badge {
  font-weight: 500;
  padding: 0.5em 0.7em;
}
</style>
