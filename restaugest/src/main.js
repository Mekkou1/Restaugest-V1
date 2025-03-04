import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import global styles
import './assets/styles/main.css';

// Create Vue app
const app = createApp(App);

// Use plugins
app.use(router);
app.use(store);

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err);
  console.error('Vue component:', vm);
  console.error('Error info:', info);
  
  // You could also send errors to a logging service here
  if (process.env.NODE_ENV === 'production') {
    // Log to service in production
  }
};

// Global properties
app.config.globalProperties.$filters = {
  // Format currency
  currency(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(value);
  },
  
  // Format date
  date(value) {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(new Date(value));
  }
};

// Mount app
app.mount('#app');

// Handle service worker if in production
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered:', registration);
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}

// Export app instance
export default app;
