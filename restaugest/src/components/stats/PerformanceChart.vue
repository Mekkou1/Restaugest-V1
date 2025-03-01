<template>
  <div class="performance-chart">
    <h2>Performances des Employés</h2>
    <div class="chart-filters">
      <select v-model="selectedPeriod" class="form-control">
        <option value="day">Jour</option>
        <option value="week">Semaine</option>
        <option value="month">Mois</option>
      </select>
    </div>
    <div class="chart-container">
      <canvas ref="performanceChart"></canvas>
    </div>
    <div class="stats-details">
      <div v-for="stat in performanceStats" :key="stat.employe_id" class="stat-item">
        <h4>{{ stat.nom }} {{ stat.prenom }}</h4>
        <p>Commandes traitées: {{ stat.nombre_commandes }}</p>
        <p>Total des ventes: {{ stat.total_ventes }} FCFA</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import Chart from 'chart.js/auto'

export default {
  name: 'PerformanceChart',
  data() {
    return {
      selectedPeriod: 'day',
      performanceStats: [],
      chart: null
    }
  },
  methods: {
    async fetchPerformanceData() {
      try {
        const response = await axios.get(`/api/performances?period=${this.selectedPeriod}`)
        this.performanceStats = response.data
        this.updateChart()
      } catch (error) {
        console.error('Erreur lors de la récupération des performances:', error)
      }
    },
    updateChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const ctx = this.$refs.performanceChart.getContext('2d')
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.performanceStats.map(stat => `${stat.nom} ${stat.prenom}`),
          datasets: [{
            label: 'Ventes (FCFA)',
            data: this.performanceStats.map(stat => stat.total_ventes),
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  },
  watch: {
    selectedPeriod() {
      this.fetchPerformanceData()
    }
  },
  mounted() {
    this.fetchPerformanceData()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>

<style scoped>
.performance-chart {
  padding: 20px;
}
.chart-filters {
  margin-bottom: 20px;
}
.chart-container {
  height: 400px;
  margin-bottom: 20px;
}
.stats-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
.stat-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
