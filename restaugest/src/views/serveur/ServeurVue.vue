<template>
  <div class="connect">
    <!-- Header -->
    <header class="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
      <div class="d-flex align-items-center">
        <img src="@/assets/Logo.png" alt="Logo" class="me-2" style="width: 50px; height: 50px;">
        <h1 class="mb-0">Serveur</h1>
      </div>
      <div class="date-heure d-flex gap-3">
        <span>Date : {{ date }}</span>
        <span>Heure : {{ heure }}</span>
      </div>
    </header>

    <!-- Statistics Section -->
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Commandes totales</h3>
          <p>{{ stats.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Commandes complétées</h3>
          <p>{{ stats.completedOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Commandes en attente</h3>
          <p>{{ stats.pendingOrders }}</p>
        </div>
      </div>
    </div>

    <div class="commande-container">
      <ComandeVue />
    </div>

  </div>
</template>

<script>
import ComandeVue from '@/components/ComandeVue.vue';
import { getServerStats } from '@/utils/api';

export default {
  name: 'ServeurVue',
  components: {
    ComandeVue,
  },
  data() {
    return {
      date: new Date().toLocaleDateString(),
      heure: new Date().toLocaleTimeString(),
      stats: {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        averagePreparationTime: 0,
        customerSatisfaction: 0
      }
    };
  },
  async created() {
    await this.fetchStats();
    setInterval(this.updateTime, 1000);
  },
  methods: {
    async fetchStats() {
      try {
        const response = await getServerStats();
        this.stats = response.data;
      } catch (error) {
        console.error('Error fetching server stats:', error);
      }
    },
    updateTime() {
      this.date = new Date().toLocaleDateString();
      this.heure = new Date().toLocaleTimeString();
    }
  }
};
</script>

<style>
body {
  background-color: #ff6600;
  margin: 0;
  font-family: Arial, sans-serif;
}

.h1 {
  font-family: Arial, sans-serif;
  padding: 20px;
}

.stats-container {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #333;
}

.stat-card p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6600;
}

.commande-container {
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

</style>
