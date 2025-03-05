export default [
    {
      path: 'admin',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { 
        requiresAuth: true,
        role: 'Administrateur'
      },
      children: [
        {
          path: 'users',
          name: 'GestionUtilisateurs',
          component: () => import('@/views/admin/GestionUtilisateurs.vue')
        },
        {
          path: 'users/new',
          name: 'NouvelUtilisateur',
          component: () => import('@/views/admin/FormulaireUtilisateur.vue')
        },
        {
          path: 'users/:id',
          name: 'EditerUtilisateur',
          component: () => import('@/views/admin/FormulaireUtilisateur.vue'),
          props: true
        },
        {
          path: 'menu',
          name: 'GestionCarteMenu',
          component: () => import('@/views/admin/GestionCarteMenu.vue')
        },
        {
          path: 'salles',
          name: 'GestionSalles',
          component: () => import('@/views/admin/GestionSalles.vue')
        },
        {
          path: 'tables',
          name: 'GestionTables',
          component: () => import('@/views/admin/GestionTables.vue')
        },
        {
          path: 'stats',
          name: 'Statistiques',
          component: () => import('@/views/admin/Statistiques.vue')
        },
        {
          path: 'settings',
          name: 'Parametres',
          component: () => import('@/views/admin/Parametres.vue')
        },
        {
          path: 'logs',
          name: 'SystemLogs',
          component: () => import('@/views/admin/SystemLogs.vue')
        },
        {
          path: 'backup',
          name: 'BackupRestore',
          component: () => import('@/views/admin/BackupRestore.vue')
        }
      ]
    }
  ];
  