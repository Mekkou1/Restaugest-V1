<template>
  <div class="home">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1>Bienvenue, {{ currentUser?.prenom }} {{ currentUser?.nom }}</h1>
      <p class="text-muted">{{ getCurrentDateTime() }}</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card" v-if="isAdmin || isCaissier">
        <div class="stat-icon bg-success">
          <i class="fas fa-cash-register"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.dailyRevenue || '0' }} €</h3>
          <p>Chiffre du jour</p>
        </div>
      </div>

      <div class="stat-card" v-if="isAdmin || isServeur">
        <div class="stat-icon bg-primary">
          <i class="fas fa-utensils"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeOrders || '0' }}</h3>
          <p>Commandes actives</p>
        </div>
      </div>

      <div class="stat-card" v-if="isAdmin || isCuisinier">
        <div class="stat-icon bg-warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pendingOrders || '0' }}</h3>
          <p>En attente cuisine</p>
        </div>
      </div>

      <div class="stat-card" v-if="isAdmin">
        <div class="stat-icon bg-info">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeUsers || '0' }}</h3>
          <p>Utilisateurs actifs</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Actions rapides</h2>
      <div class="actions-grid">
        <!-- Admin Actions -->
        <template v-if="isAdmin">
          <router-link to="/admin/users" class="action-card">
            <i class="fas fa-user-cog"></i>
            <span>Gestion utilisateurs</span>
          </router-link>
          <router-link to="/admin/menu" class="action-card">
            <i class="fas fa-book-open"></i>
            <span>Gestion menu</span>
          </router-link>
          <router-link to="/admin/stats" class="action-card">
            <i class="fas fa-chart-bar"></i>
            <span>Statistiques</span>
          </router-link>
        </template>

        <!-- Caissier Actions -->
        <template v-if="isCaissier">
          <router-link to="/caisse/tickets" class="action-card">
            <i class="fas fa-receipt"></i>
            <span>Tickets</span>
          </router-link>
          <router-link to="/caisse/paiements" class="action-card">
            <i class="fas fa-money-bill-wave"></i>
            <span>Paiements</span>
          </router-link>
        </template>

        <!-- Serveur Actions -->
        <template v-if="isServeur">
          <router-link to="/serveur/commandes" class="action-card">
            <i class="fas fa-clipboard-list"></i>
            <span>Commandes</span>
          </router-link>
          <router-link to="/serveur/tables" class="action-card">
            <i class="fas fa-chair"></i>
            <span>Tables</span>
          </router-link>
        </template>

        <!-- Cuisinier Actions -->
        <template v-if="isCuisinier">
          <router-link to="/cuisine/commandes" class="action-card">
            <i class="fas fa-utensils"></i>
            <span>Commandes cuisine</span>
          </router-link>
          <router-link to="/cuisine/stock" class="action-card">
            <i class="fas fa-warehouse"></i>
            <span>Stock</span>
          </router-link>
        </template>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity" v-if="activities.length > 0">
      <h2>Activité récente</h2>
      <div class="activity-list">
        <div 
          v-for="activity in activities" 
          :key="activity.id" 
          class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.message }}</p>
            <small class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'HomeVue',

  setup() {
    const store = useStore();
    const stats = ref({});
    const activities = ref([]);

    const currentUser = computed(() => store.getters['auth/getUser']);
    const isAdmin = computed(() => currentUser.value?.role === 'Administrateur');
    const isCaissier = computed(() => currentUser.value?.role === 'Caissier');
    const isServeur = computed(() => currentUser.value?.role === 'Serveur');
    const isCuisinier = computed(() => currentUser.value?.role === 'Cuisinier');

    const getCurrentDateTime = () => {
      return new Date().toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getActivityIcon = (type) => {
      const icons = {
        order: 'fas fa-utensils',
        payment: 'fas fa-money-bill-wave',
        user: 'fas fa-user',
        system: 'fas fa-cog'
      };
      return icons[type] || 'fas fa-info-circle';
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
        // Load stats based on user role
        if (isAdmin.value) {
          const response = await store.dispatch('stats/fetchAdminStats');
          stats.value = response;
        } else if (isCaissier.value) {
          const response = await store.dispatch('stats/fetchCaissierStats');
          stats.value = response;
        } else if (isServeur.value) {
          const response = await store.dispatch('stats/fetchServeurStats');
          stats.value = response;
        } else if (isCuisinier.value) {
          const response = await store.dispatch('stats/fetchCuisinierStats');
          stats.value = response;
        }

        // Load recent activities
        const recentActivities = await store.dispatch('stats/fetchRecentActivities');
        activities.value = recentActivities;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    onMounted(() => {
      loadDashboardData();
    });

    return {
      currentUser,
      stats,
      activities,
      isAdmin,
      isCaissier,
      isServeur,
      isCuisinier,
      getCurrentDateTime,
      getActivityIcon,
      formatTimeAgo
    };
  }
};
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-content h3 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.stat-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h2 {
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: var(--dark-color);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: var(--primary-color);
}

.action-card i {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

/* Recent Activity */
.recent-activity {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-activity h2 {
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-icon.order { background-color: var(--primary-color); }
.activity-icon.payment { background-color: var(--success-color); }
.activity-icon.user { background-color: var(--info-color); }
.activity-icon.system { background-color: var(--secondary-color); }

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0;
  line-height: 1.4;
}

.activity-time {
  color: #6c757d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .welcome-section h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-icon {
    margin-bottom: 0.5rem;
  }
}
</style>
