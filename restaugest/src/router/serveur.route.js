export default [
  {
    path: 'serveur',
    name: 'ServeurDashboard',
    component: () => import('@/views/serveur/ServeurDashboard.vue'),
    meta: {
      requiresAuth: true,
      role: 'Serveur'
    },
    children: [
      {
        path: 'tables',
        name: 'TableStatus',
        component: () => import('@/views/serveur/TableStatus.vue')
      },
      {
        path: 'commandes',
        name: 'GestionCommandes',
        component: () => import('@/views/serveur/GestionCommandes.vue')
      },
      {
        path: 'commandes/nouvelle',
        name: 'NouvelleCommande',
        component: () => import('@/views/serveur/FormulaireCommande.vue')
      },
      {
        path: 'commandes/:id',
        name: 'DetailCommande',
        component: () => import('@/views/serveur/DetailCommande.vue'),
        props: true
      },
      {
        path: 'tables/:id',
        name: 'DetailTable',
        component: () => import('@/views/serveur/DetailTable.vue'),
        props: true
      },
      {
        path: 'service',
        name: 'ServiceStatus',
        component: () => import('@/views/serveur/ServiceStatus.vue')
      },
      {
        path: 'notifications',
        name: 'NotificationsServeur',
        component: () => import('@/views/serveur/Notifications.vue')
      }
    ]
  }
];
