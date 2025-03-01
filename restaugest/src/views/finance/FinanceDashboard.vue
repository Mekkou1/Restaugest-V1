<template>
  <DashboardLayout :title="'Module Finance'" :menuItems="menuItems">
    <div class="container-fluid">
      <!-- Résumé financier -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Chiffre d'affaires du jour</h5>
              <p class="card-text amount">{{ dailyRevenue }} FCFA</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Transactions en cours</h5>
              <p class="card-text amount">{{ pendingTransactions }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Solde des caisses</h5>
              <p class="card-text amount">{{ totalBalance }} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sections principales -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Gestion des Devises</h5>
            </div>
            <div class="card-body">
              <DeviseManager />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5>Gestion du Billetage</h5>
            </div>
            <div class="card-body">
              <BilletageManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import DeviseManager from '@/components/finance/DeviseManager.vue'
import BilletageManager from '@/components/finance/BilletageManager.vue'
import axios from '@/utils/axios'

export default {
  name: 'FinanceDashboard',
  components: {
    DashboardLayout,
    DeviseManager,
    BilletageManager
  },
  data() {
    return {
      dailyRevenue: 0,
      pendingTransactions: 0,
      totalBalance: 0,
      menuItems: [
        { 
          name: 'dashboard', 
          label: 'Tableau de bord', 
          path: '/finance',
          icon: 'fas fa-chart-line'
        },
        { 
          name: 'devises', 
          label: 'Gestion des Devises', 
          path: '/finance/devises',
          icon: 'fas fa-money-bill-wave'
        },
        { 
          name: 'billetage', 
          label: 'Gestion du Billetage', 
          path: '/finance/billetage',
          icon: 'fas fa-cash-register'
        },
        { 
          name: 'transactions', 
          label: 'Transactions', 
          path: '/finance/transactions',
          icon: 'fas fa-exchange-alt'
        },
        { 
          name: 'rapports', 
          label: 'Rapports Financiers', 
          path: '/finance/rapports',
          icon: 'fas fa-file-invoice-dollar'
        }
      ]
    }
  },
  methods: {
    async fetchFinancialData() {
      try {
        const response = await axios.get('/api/finance/summary')
        const { dailyRevenue, pendingTransactions, totalBalance } = response.data
        this.dailyRevenue = dailyRevenue
        this.pendingTransactions = pendingTransactions
        this.totalBalance = totalBalance
      } catch (error) {
        console.error('Erreur lors de la récupération des données financières:', error)
      }
    }
  },
  mounted() {
    this.fetchFinancialData()
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
</style>
