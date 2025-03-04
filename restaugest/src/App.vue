<template>
  <div id="app">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script>
import { setupAuthInterceptor } from './utils/auth';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'App',
  
  data() {
    return {
      loading: true
    };
  },

  computed: {
    ...mapState({
      isAuthenticated: state => state.auth.isAuthenticated,
      user: state => state.auth.user
    })
  },

  methods: {
    ...mapActions(['checkAuth']),

    async initializeApp() {
      try {
        // Setup API interceptors
        setupAuthInterceptor();
        
        // Check authentication status
        await this.checkAuth();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        this.loading = false;
      }
    }
  },

  created() {
    this.initializeApp();
  },

  mounted() {
    // Listen for authentication events
    window.addEventListener('storage', (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab
        this.$router.push('/login');
      }
    });
  }
};
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
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

/* Réinitialisation CSS de base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Variables CSS globales */
:root {
  --primary-color: #ff6600;
  --secondary-color: #333;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
}

/* Styles de base */
body {
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

/* Styles des boutons */
.btn {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
}

/* Styles des formulaires */
.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.2);
}

/* Styles des cartes */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Styles des alertes */
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: var(--success-color);
  color: white;
}

.alert-danger {
  background-color: var(--danger-color);
  color: white;
}

/* Styles des tableaux */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
}

th {
  background-color: var(--background-color);
  font-weight: 600;
}

/* Styles des icônes */
.icon {
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
}

/* Styles des badges */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Styles des tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  background-color: var(--secondary-color);
  color: white;
  text-align: center;
  padding: 5px;
  border-radius: 4px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Styles des modales */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

/* Styles des spinners */
.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

/* Styles des transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Styles responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .card {
    padding: 0.75rem;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
}
</style>
