export default {
    path: 'serveur',
    name: 'serveur',
    component: () => import('../views/serveur/ServeurVue.vue'),
    meta: { 
      requiresAuth: true, 
      role: 'Serveur',
      title: 'Interface Serveur',
      saveState: true
    },
    children: [
      {
        path: 'commandes',
        name: 'serveur-commandes',
        component: () => import('../components/serveur/CommandeEnhanced.vue'),
        meta: {
          title: 'Prise de commandes'
        }
      },
      {
        path: 'encours',
        name: 'serveur-encours',
        component: () => import('../views/serveur/CommandesEnCours.vue'),
        meta: {
          title: 'Commandes en cours'
        }
      }
    ]
  };
  