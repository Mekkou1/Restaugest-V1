<template>
  <DashboardLayout :title="'Module Statistiques'" :menuItems="menuItems">
    <div class="container-fluid">
      <!-- Résumé des statistiques -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ventes Journalières</h5>
              <p class="card-text amount">{{ stats.dailySales }} FCFA</p>
              <div class="trend" :class="getTrendClass(stats.dailyTrend)">
                {{ stats.dailyTrend }}%
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Commandes du Jour</h5>
              <p class="card-text amount">{{ stats.dailyOrders }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Performance Moyenne</h5>
              <p class="card-text amount">{{ stats.averagePerformance }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphique des performances -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Performance des Employés</h5>
            </div>
            <div class="card-body">
              <PerformanceChart />
            </div>
          </div>
        </div>
      </div>

      <!-- Top ventes et état des stocks -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Top des Ventes</h5>
            </div>
            <div class="card-body">
              <div class="top-items">
                <h6>Plats les Plus Vendus</h6>
                <ul class="list-unstyled">
                  <li v-for="item in stats.topDishes" :key="item.id">
                    {{ item.name }} - {{ item.quantity }} vendus
                  </li>
                </ul>
                <h6 class="mt-3">Boissons les Plus Vendues</h6>
                <ul class="list-unstyled">
                  <li v-for="item in stats.topDrinks" :key="item.id">
                    {{ item.name }} - {{ item.quantity }} vendus
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>État des Stocks</h5>
            </div>
            <div class="card-body">
              <StockTracker />
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import PerformanceChart from '@/components/stats/PerformanceChart.vue'
import StockTracker from '@/components/stock/StockTracker.vue'
import axios from '@/utils/axios'

export default {
  name: 'StatsDashboard',
  components: {
    DashboardLayout,
    PerformanceChart,
    StockTracker
  },
  data() {
    return {
      stats: {
        dailySales: 0,
        dailyTrend: 0,
        dailyOrders: 0,
        averagePerformance: 0,
        topDishes: [],
        topDrinks: []
      },
      menuItems: [
        { 
          name: 'dashboard', 
          label: 'Tableau de bord', 
          path: '/statistiques',
          icon: 'fas fa-chart-bar'
        },
        { 
          name: 'ventes', 
          label: 'Analyse des Ventes', 
          path: '/statistiques/ventes',
          icon: 'fas fa-shopping-cart'
        },
        { 
          name: 'performance', 
          label: 'Performance Employés', 
          path: '/statistiques/performance',
          icon: 'fas fa-user-chart'
        },
        { 
          name: 'stocks', 
          label: 'Suivi des Stocks', 
          path: '/statistiques/stocks',
          icon: 'fas fa-boxes'
        },
        { 
          name: 'rapports', 
          label: 'Rapports Détaillés', 
          path: '/statistiques/rapports',
          icon: 'fas fa-file-alt'
        }
      ]
    }
  },
  methods: {
    async fetchStats() {
      try {
        const response = await axios.get('/api/statistics/summary')
        this.stats = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      }
    },
    getTrendClass(trend) {
      return {
        'trend-up': trend > 0,
        'trend-down': trend < 0,
        'trend-neutral': trend === 0
      }
    }
  },
  mounted() {
    this.fetchStats()
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: none;
  padding: 1rem;
}

.card-header h5 {
  margin: 0;
  color: #ff6600;
}

.card-body {
  padding: 1.25rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6600;
  margin: 0;
}

.card-title {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.trend {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: bold;
}

.trend-up {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.trend-down {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

.trend-neutral {
  color: #6c757d;
  background-color: rgba(108, 117, 125, 0.1);
}

.top-items h6 {
  color: #ff6600;
  margin-bottom: 1rem;
}

.top-items ul li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.top-items ul li:last-child {
  border-bottom: none;
}
</style>
