import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Bootstrap et BootstrapVue
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import des styles personnalisés
import './assets/styles/main.css'

// Création de l'application
const app = createApp(App)

console.log('Application created, initializing plugins...')

// Verify initial authentication state
const token = localStorage.getItem('token')
console.log('Initial authentication check:', { 
  hasToken: !!token,
  userRole: localStorage.getItem('role')
})

// Utilisation des plugins
app.use(router)
console.log('Router initialized')

app.use(store)
console.log('Store initialized')

// Montage de l'application
console.log('Mounting application...')
app.mount('#app')
console.log('Application mounted')
