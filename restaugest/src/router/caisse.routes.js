import CaisseView from '@/views/caisse/CaisseView.vue';

export default [
  {
    path: '/caisse',
    name: 'caisse',
    component: CaisseView,
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'CAISSIER'],
      title: 'Caisse'
    },
    children: [
      {
        path: 'tickets',
        name: 'caisse-tickets',
        component: () => import('@/components/caisse/TicketManager.vue'),
        meta: {
          title: 'Gestion des tickets'
        }
      },
      {
        path: 'tickets/:id',
        name: 'caisse-ticket-details',
        component: () => import('@/components/caisse/TicketDetails.vue'),
        props: true,
        meta: {
          title: 'Détails du ticket'
        }
      },
      {
        path: 'avoirs',
        name: 'caisse-avoirs',
        component: () => import('@/components/caisse/AvoirManager.vue'),
        meta: {
          title: 'Gestion des avoirs'
        }
      },
      {
        path: 'fonds',
        name: 'caisse-fonds',
        component: () => import('@/components/caisse/FondsManager.vue'),
        meta: {
          title: 'Gestion des fonds'
        }
      },
      {
        path: 'transferts',
        name: 'caisse-transferts',
        component: () => import('@/components/caisse/TransfertManager.vue'),
        meta: {
          title: 'Transferts entre caisses'
        }
      },
      {
        path: 'journal',
        name: 'caisse-journal',
        component: () => import('@/components/caisse/JournalCaisse.vue'),
        meta: {
          title: 'Journal des opérations'
        }
      },
      {
        path: 'rapports',
        name: 'caisse-rapports',
        component: () => import('@/components/caisse/RapportsCaisse.vue'),
        meta: {
          title: 'Rapports de caisse'
        }
      },
      {
        path: 'stats',
        name: 'caisse-stats',
        component: () => import('@/components/caisse/StatsCaisse.vue'),
        meta: {
          title: 'Statistiques'
        }
      },
      {
        path: 'config',
        name: 'caisse-config',
        component: () => import('@/components/caisse/ConfigCaisse.vue'),
        meta: {
          roles: ['ADMIN'],
          title: 'Configuration'
        }
      },
      {
        path: 'devises',
        name: 'caisse-devises',
        component: () => import('@/components/caisse/GestionDevises.vue'),
        meta: {
          roles: ['ADMIN'],
          title: 'Gestion des devises'
        }
      },
      {
        path: 'autorisations',
        name: 'caisse-autorisations',
        component: () => import('@/components/caisse/AutorisationsCaisse.vue'),
        meta: {
          roles: ['ADMIN'],
          title: 'Gestion des autorisations'
        }
      },
      {
        path: 'modes-paiement',
        name: 'caisse-modes-paiement',
        component: () => import('@/components/caisse/ModePaiementManager.vue'),
        meta: {
          roles: ['ADMIN'],
          title: 'Modes de paiement'
        }
      },
      {
        path: 'remises',
        name: 'caisse-remises',
        component: () => import('@/components/caisse/RemiseManager.vue'),
        meta: {
          roles: ['ADMIN'],
          title: 'Gestion des remises'
        }
      },
      {
        path: 'impression',
        name: 'caisse-impression',
        component: () => import('@/components/caisse/ImpressionManager.vue'),
        meta: {
          roles: ['ADMIN'],
          title: 'Configuration des impressions'
        }
      }
    ]
  }
];
