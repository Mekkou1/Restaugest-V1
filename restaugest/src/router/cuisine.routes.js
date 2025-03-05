export default [
    {
      path: 'cuisine',
      name: 'CuisineDashboard',
      component: () => import('@/views/cuisine/CuisineDashboard.vue'),
      meta: {
        requiresAuth: true,
        role: 'Cuisinier'
      },
      children: [
        {
          path: 'commandes',
          name: 'CommandesCuisine',
          component: () => import('@/views/cuisine/CommandesCuisine.vue')
        },
        {
          path: 'commandes/:id',
          name: 'DetailCommandeCuisine',
          component: () => import('@/views/cuisine/DetailCommande.vue'),
          props: true
        },
        {
          path: 'preparation',
          name: 'PreparationPlats',
          component: () => import('@/views/cuisine/PreparationPlats.vue')
        },
        {
          path: 'stock',
          name: 'GestionStock',
          component: () => import('@/views/cuisine/GestionStock.vue')
        },
        {
          path: 'recettes',
          name: 'GestionRecettes',
          component: () => import('@/views/cuisine/GestionRecettes.vue')
        },
        {
          path: 'recettes/nouvelle',
          name: 'NouvelleRecette',
          component: () => import('@/views/cuisine/FormulaireRecette.vue')
        },
        {
          path: 'recettes/:id',
          name: 'ModifierRecette',
          component: () => import('@/views/cuisine/FormulaireRecette.vue'),
          props: true
        },
        {
          path: 'planning',
          name: 'PlanningCuisine',
          component: () => import('@/views/cuisine/PlanningCuisine.vue')
        },
        {
          path: 'alertes',
          name: 'AlertesCuisine',
          component: () => import('@/views/cuisine/AlertesCuisine.vue')
        }
      ]
    }
  ];
  