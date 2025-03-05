import MainLayout from '../layouts/MainLayout.vue'
import adminRoutes from './admin.routes'
import serveurRoutes from './serveur.routes'
import caisseRoutes from './caisse.routes'
import cuisineRoutes from './cuisine.routes'

export const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/HomeVue.vue'),
        meta: { requiresAuth: true }
      },
      ...adminRoutes,
      ...serveurRoutes,
      ...caisseRoutes,
      ...cuisineRoutes
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginVue.vue'),
    meta: { guest: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

export default routes
