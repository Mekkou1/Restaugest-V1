<template>
    <div class="admin-dashboard">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Utilisateurs actifs</h3>
              <p class="text-2xl font-semibold">{{ stats.activeUsers }}</p>
            </div>
            <div class="text-blue-500 bg-blue-100 rounded-full p-3">
              <i class="fas fa-users text-xl"></i>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            <span :class="stats.usersTrend > 0 ? 'text-green-500' : 'text-red-500'">
              <i :class="stats.usersTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ Math.abs(stats.usersTrend) }}%
            </span>
            depuis hier
          </div>
        </div>
  
        <div class="stat-card bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Chiffre du jour</h3>
              <p class="text-2xl font-semibold">{{ formatPrice(stats.dailyRevenue) }}</p>
            </div>
            <div class="text-green-500 bg-green-100 rounded-full p-3">
              <i class="fas fa-euro-sign text-xl"></i>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            <span :class="stats.revenueTrend > 0 ? 'text-green-500' : 'text-red-500'">
              <i :class="stats.revenueTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ Math.abs(stats.revenueTrend) }}%
            </span>
            depuis hier
          </div>
        </div>
  
        <div class="stat-card bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Commandes en cours</h3>
              <p class="text-2xl font-semibold">{{ stats.activeOrders }}</p>
            </div>
            <div class="text-orange-500 bg-orange-100 rounded-full p-3">
              <i class="fas fa-utensils text-xl"></i>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            <span class="text-gray-700">{{ stats.completedOrders }}</span>
            commandes terminées aujourd'hui
          </div>
        </div>
  
        <div class="stat-card bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Tables occupées</h3>
              <p class="text-2xl font-semibold">{{ stats.occupiedTables }}/{{ stats.totalTables }}</p>
            </div>
            <div class="text-purple-500 bg-purple-100 rounded-full p-3">
              <i class="fas fa-chair text-xl"></i>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            Taux d'occupation : {{ Math.round((stats.occupiedTables / stats.totalTables) * 100) }}%
          </div>
        </div>
      </div>
  
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Actions rapides</h2>
          <div class="grid grid-cols-2 gap-4">
            <button 
              v-for="action in quickActions" 
              :key="action.name"
              @click="action.handler"
              class="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i :class="[action.icon, 'text-xl mr-3', action.iconColor]"></i>
              <span>{{ action.name }}</span>
            </button>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Alertes système</h2>
          <div class="space-y-4">
            <div 
              v-for="alert in systemAlerts" 
              :key="alert.id"
              :class="['flex items-start p-3 rounded-lg', alert.bgColor]"
            >
              <i :class="[alert.icon, 'text-xl mr-3', alert.iconColor]"></i>
              <div>
                <h4 class="font-medium">{{ alert.title }}</h4>
                <p class="text-sm text-gray-600">{{ alert.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Recent Activity -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Activité récente</h2>
          <button class="text-blue-500 hover:text-blue-600">
            Voir tout
          </button>
        </div>
        <div class="space-y-4">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="flex items-start border-b border-gray-100 pb-4 last:border-0"
          >
            <div :class="['rounded-full p-2 mr-3', activity.bgColor]">
              <i :class="[activity.icon, activity.iconColor]"></i>
            </div>
            <div>
              <p class="font-medium">{{ activity.title }}</p>
              <p class="text-sm text-gray-600">{{ activity.description }}</p>
              <span class="text-xs text-gray-500">{{ formatTimeAgo(activity.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  
  export default {
    name: 'AdminDashboard',
  
    setup() {
      const router = useRouter();
      const store = useStore();
  
      const stats = ref({
        activeUsers: 0,
        usersTrend: 0,
        dailyRevenue: 0,
        revenueTrend: 0,
        activeOrders: 0,
        completedOrders: 0,
        occupiedTables: 0,
        totalTables: 0
      });
  
      const quickActions = [
        {
          name: 'Nouvel utilisateur',
          icon: 'fas fa-user-plus',
          iconColor: 'text-blue-500',
          handler: () => router.push('/admin/users/new')
        },
        {
          name: 'Gérer les tables',
          icon: 'fas fa-chair',
          iconColor: 'text-purple-500',
          handler: () => router.push('/admin/tables')
        },
        {
          name: 'Menu du jour',
          icon: 'fas fa-utensils',
          iconColor: 'text-orange-500',
          handler: () => router.push('/admin/menu')
        },
        {
          name: 'Rapports',
          icon: 'fas fa-chart-bar',
          iconColor: 'text-green-500',
          handler: () => router.push('/admin/reports')
        }
      ];
  
      const systemAlerts = ref([
        {
          id: 1,
          title: 'Stock faible',
          message: 'Certains produits sont en rupture de stock',
          icon: 'fas fa-exclamation-triangle',
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50'
        },
        {
          id: 2,
          title: 'Mise à jour système',
          message: 'Une nouvelle mise à jour est disponible',
          icon: 'fas fa-info-circle',
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50'
        }
      ]);
  
      const recentActivities = ref([]);
  
      const formatPrice = (value) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);
      };
  
      const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 60) return 'il y a quelques secondes';
        if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} minutes`;
        if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} heures`;
        return `il y a ${Math.floor(seconds / 86400)} jours`;
      };
  
      const loadDashboardData = async () => {
        try {
          // Load stats
          const dashboardStats = await store.dispatch('admin/fetchDashboardStats');
          stats.value = dashboardStats;
  
          // Load recent activities
          const activities = await store.dispatch('admin/fetchRecentActivities');
          recentActivities.value = activities;
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      };
  
      onMounted(() => {
        loadDashboardData();
      });
  
      return {
        stats,
        quickActions,
        systemAlerts,
        recentActivities,
        formatPrice,
        formatTimeAgo
      };
    }
  };
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 1.5rem;
  }
  
  .stat-card {
    transition: transform 0.2s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .admin-dashboard {
      padding: 1rem;
    }
  }
  </style>
  