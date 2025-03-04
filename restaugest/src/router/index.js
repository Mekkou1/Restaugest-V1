import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeVue.vue'),
    meta: { requiresAuth: false },
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
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
      if (isAuthenticated()) {
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
          const user = getCurrentUser();
          switch (user?.role) {
            case 'Administrateur': return '/dashboard/admin';
            case 'Caissier': return '/dashboard/caisse';
            case 'Serveur': return '/dashboard/serveur';
            case 'Cuisinier': return '/dashboard/cuisine';
            default: return '/login';
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
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.meta.role;
  const user = getCurrentUser();

  // Log navigation details
  console.group('Navigation');
  console.log('From:', from.path);
  console.log('To:', to.path);
  console.log('Requires auth:', requiresAuth);
  console.log('Required role:', requiredRole);
  console.log('Current user:', user);
  console.groupEnd();

  // Handle authentication
  if (requiresAuth && !isAuthenticated()) {
    console.log('Authentication required, redirecting to login');
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath }
    });
    return;
  }

  // Handle role-based access
  if (requiredRole && user?.role !== requiredRole) {
    console.log('Unauthorized role, redirecting to dashboard');
    next('/dashboard');
    return;
  }

  next();
});

export default router;
