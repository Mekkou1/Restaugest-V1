import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { sessionManager } from './utils/session';

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import global styles
import './assets/styles/main.css';

// Create Vue app
const app = createApp(App);

// Use plugins
app.use(router);
app.use(store);

// Global error handler
app.config.errorHandler = (error, vm, info) => {
  console.error('Global error:', error);
  console.error('Component:', vm);
  console.error('Info:', info);

  // Handle authentication errors
  if (error.response?.status === 401) {
    store.dispatch('auth/logout').then(() => {
      router.push({
        name: 'Login',
        query: { redirect: router.currentRoute.value.fullPath }
      });
    });
  }

  // Show error notification
  store.dispatch('addNotification', {
    type: 'error',
    message: 'Une erreur est survenue',
    timeout: 5000
  });
};

// Global properties
app.config.globalProperties.$formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

app.config.globalProperties.$timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'il y a quelques secondes';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} heures`;
  return `il y a ${Math.floor(seconds / 86400)} jours`;
};

// Initialize store
store.dispatch('initializeStore').catch(console.error);

// Mount app
app.mount('#app');

// Export app instance
export default app;
