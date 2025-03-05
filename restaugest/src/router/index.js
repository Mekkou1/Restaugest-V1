import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiredRole = to.matched.find(record => record.meta.role)?.meta.role

  // Get current auth state
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const currentUser = store.getters['auth/getUser']

  try {
    // If not authenticated but has token, try to restore session
    if (!isAuthenticated && localStorage.getItem('token')) {
      await store.dispatch('auth/checkAuth')
    }

    // Handle authentication requirements
    if (requiresAuth) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return next({ 
          name: 'Login',
          query: { redirect: to.fullPath }
        })
      }

      // Check role requirements
      if (requiredRole && currentUser.role !== requiredRole) {
        // Redirect to home if wrong role
        return next({ name: 'Home' })
      }
    }

    // Handle guest-only routes (like login)
    if (requiresGuest && isAuthenticated) {
      return next({ name: 'Home' })
    }

    // If all checks pass, proceed
    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    // Clear auth state if error occurs
    await store.dispatch('auth/logout')
    next({ 
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  }
})

// After navigation complete
router.afterEach((to) => {
  // Update document title
  document.title = `${to.name} - Restaugest` || 'Restaugest'

  // Log navigation for analytics
  if (process.env.NODE_ENV === 'production') {
    // Implement analytics logging here
  }
})

// Handle navigation errors
router.onError((error) => {
  console.error('Navigation error:', error)
  router.push({ name: 'NotFound' })
})

export default router
