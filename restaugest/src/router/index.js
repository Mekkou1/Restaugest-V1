import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeVue.vue'),
    meta: { requiresAuth: false },
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next('/dashboard');
      } else {
        next();
      }
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginVue.vue'),
    meta: { requiresAuth: false },
    beforeEnter: (to, from, next) => {
      if (store.getters.isAuthenticated) {
        next('/dashboard');
      } else {
        next();
      }
    }
  },
  {
    path: '/dashboard',
    component: () => import('../components/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: () => {
          const userRole = store.getters.userRole;
          switch (userRole) {
            case 'Administrateur': return '/dashboard/admin';
            case 'Caissier': return '/dashboard/caisse';
            case 'Serveur': return '/dashboard/serveur';
            case 'Cuisine': return '/dashboard/cuisine';
            default: return '/';
          }
        }
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('../views/admin/AdminVue.vue'),
        meta: { requiresAuth: true, role: 'Administrateur' }
      },
      {
        path: 'caisse',
        name: 'caisse',
        component: () => import('../views/caisse/CaisseVue.vue'),
        meta: { requiresAuth: true, role: 'Caissier' }
      },
      {
        path: 'serveur',
        name: 'serveur',
        component: () => import('../views/serveur/ServeurVue.vue'),
        meta: { requiresAuth: true, role: 'Serveur' }
      },
      {
        path: 'cuisine',
        name: 'cuisine',
        component: () => import('../views/cuisine/CuisineVue.vue'),
        meta: { requiresAuth: true, role: 'Cuisinier' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  console.group('Navigation');
  console.log('From:', from.path);
  console.log('To:', to.path);
  console.log('Requires auth:', to.meta.requiresAuth);
  console.log('Required role:', to.meta.role);
  console.groupEnd();

  const isAuthenticated = store.getters.isAuthenticated;
  const userRole = store.getters.userRole;

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    next('/login');
  } else if (to.meta.role && to.meta.role !== userRole) {
    console.log('User role does not match required role, redirecting to home');
    next('/');
  } else {
    next();
  }
});

export default router;
