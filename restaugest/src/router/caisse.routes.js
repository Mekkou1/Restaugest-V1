export default [
  {
    path: 'caisse',
    name: 'CaisseDashboard',
    component: () => import('@/views/caisse/CaisseDashboard.vue'),
    meta: {
      requiresAuth: true,
      role: 'Caissier'
    },
    children: [
      {
        path: 'tickets',
        name: 'GestionTickets',
        component: () => import('@/views/caisse/GestionTickets.vue')
      },
      {
        path: 'tickets/nouveau',
        name: 'NouveauTicket',
        component: () => import('@/views/caisse/FormulaireTicket.vue')
      },
      {
        path: 'tickets/:id',
        name: 'DetailTicket',
        component: () => import('@/views/caisse/DetailTicket.vue'),
        props: true
      },
      {
        path: 'paiements',
        name: 'GestionPaiements',
        component: () => import('@/views/caisse/GestionPaiements.vue')
      },
      {
        path: 'cloture',
        name: 'ClotureCaisse',
        component: () => import('@/views/caisse/ClotureCaisse.vue')
      },
      {
        path: 'rapports',
        name: 'RapportsCaisse',
        component: () => import('@/views/caisse/RapportsCaisse.vue')
      },
      {
        path: 'avoirs',
        name: 'GestionAvoirs',
        component: () => import('@/views/caisse/GestionAvoirs.vue')
      },
      {
        path: 'remises',
        name: 'GestionRemises',
        component: () => import('@/views/caisse/GestionRemises.vue')
      },
      {
        path: 'historique',
        name: 'HistoriqueCaisse',
        component: () => import('@/views/caisse/HistoriqueCaisse.vue')
      }
    ]
  }
];
