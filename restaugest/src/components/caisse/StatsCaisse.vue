<template>
    <div class="stats-caisse">
      <!-- Filtres de période -->
      <div class="filters-section">
        <div class="period-selector">
          <button 
            v-for="period in periods"
            :key="period.value"
            class="period-btn"
            :class="{ active: selectedPeriod === period.value }"
            @click="changePeriod(period.value)"
          >
            <i :class="period.icon"></i>
            {{ period.label }}
          </button>
        </div>
  
        <div v-if="selectedPeriod === 'custom'" class="date-range">
          <input 
            type="date" 
            v-model="dateRange.start"
            :max="today"
            class="date-input"
          >
          <span>à</span>
          <input 
            type="date" 
            v-model="dateRange.end"
            :max="today"
            class="date-input"
          >
        </div>
      </div>
  
      <!-- KPIs -->
      <div class="kpis-grid">
        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-cash-register"></i>
          </div>
          <div class="kpi-content">
            <h3>{{ formatPrice(totalVentes) }}</h3>
            <p>Chiffre d'affaires</p>
            <small :class="getVariationClass(ventesVariation)">
              {{ formatVariation(ventesVariation) }} vs période précédente
            </small>
          </div>
        </div>
  
        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="kpi-content">
            <h3>{{ totalTickets }}</h3>
            <p>Tickets émis</p>
            <small :class="getVariationClass(ticketsVariation)">
              {{ formatVariation(ticketsVariation) }} vs période précédente
            </small>
          </div>
        </div>
  
        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="kpi-content">
            <h3>{{ formatPrice(ticketMoyen) }}</h3>
            <p>Ticket moyen</p>
            <small :class="getVariationClass(ticketMoyenVariation)">
              {{ formatVariation(ticketMoyenVariation) }} vs période précédente
            </small>
          </div>
        </div>
  
        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="kpi-content">
            <h3>{{ formatPrice(totalRemises) }}</h3>
            <p>Total remises</p>
            <small>{{ pourcentageRemises }}% du CA</small>
          </div>
        </div>
      </div>
  
      <!-- Graphiques -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>Évolution des ventes</h3>
          <line-chart 
            :data="ventesData"
            :options="chartOptions.ventes"
          />
        </div>
  
        <div class="chart-card">
          <h3>Répartition par mode de paiement</h3>
          <pie-chart 
            :data="paiementsData"
            :options="chartOptions.paiements"
          />
        </div>
      </div>
  
      <!-- Tableau des ventes -->
      <div class="sales-table">
        <div class="table-header">
          <h3>Détail des ventes</h3>
          <div class="table-actions">
            <button 
              class="btn btn-secondary"
              @click="exportExcel"
            >
              <i class="fas fa-file-excel"></i>
              Exporter Excel
            </button>
            <button 
              class="btn btn-secondary"
              @click="exportPDF"
            >
              <i class="fas fa-file-pdf"></i>
              Exporter PDF
            </button>
          </div>
        </div>
  
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Référence</th>
              <th>Mode</th>
              <th>Montant</th>
              <th>Remise</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vente in ventes" :key="vente.id">
              <td>{{ formatDateTime(vente.date) }}</td>
              <td>{{ vente.reference }}</td>
              <td>{{ vente.mode_paiement }}</td>
              <td>{{ formatPrice(vente.montant) }}</td>
              <td>
                <span v-if="vente.remise" class="remise">
                  -{{ formatPrice(vente.remise) }}
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ formatPrice(vente.total) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Total</td>
              <td>{{ formatPrice(totalMontant) }}</td>
              <td>-{{ formatPrice(totalRemises) }}</td>
              <td>{{ formatPrice(totalNet) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </template>
  
  <script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Line, Pie } from 'vue-chartjs';
import api from '@/utils/api';

export default {
  name: 'StatsCaisse',

  components: {
    LineChart: Line,
    PieChart: Pie
  },

  setup() {
    const store = useStore();

    // État
    const selectedPeriod = ref('day');
    const dateRange = ref({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
    const ventes = ref([]);
    const stats = ref({
      total_ventes: 0,
      total_tickets: 0,
      total_remises: 0,
      variations: {
        ventes: 0,
        tickets: 0,
        ticket_moyen: 0
      }
    });

    // Données de référence
    const periods = [
      { value: 'day', label: 'Jour', icon: 'fas fa-calendar-day' },
      { value: 'week', label: 'Semaine', icon: 'fas fa-calendar-week' },
      { value: 'month', label: 'Mois', icon: 'fas fa-calendar-alt' },
      { value: 'custom', label: 'Personnalisé', icon: 'fas fa-calendar-plus' }
    ];

    // Computed
    const today = computed(() => new Date().toISOString().split('T')[0]);

    const totalVentes = computed(() => stats.value.total_ventes);
    const totalTickets = computed(() => stats.value.total_tickets);
    const totalRemises = computed(() => stats.value.total_remises);

    const ticketMoyen = computed(() => {
      if (totalTickets.value === 0) return 0;
      return totalVentes.value / totalTickets.value;
    });

    const ventesVariation = computed(() => stats.value.variations.ventes);
    const ticketsVariation = computed(() => stats.value.variations.tickets);
    const ticketMoyenVariation = computed(() => stats.value.variations.ticket_moyen);

    const pourcentageRemises = computed(() => {
      if (totalVentes.value === 0) return 0;
      return ((totalRemises.value / totalVentes.value) * 100).toFixed(2);
    });

    const totalMontant = computed(() => {
      return ventes.value.reduce((sum, vente) => sum + vente.montant, 0);
    });

    const totalNet = computed(() => {
      return totalMontant.value - totalRemises.value;
    });

    // Données des graphiques
    const ventesData = computed(() => ({
      labels: ventes.value.map(v => formatDate(v.date)),
      datasets: [{
        label: 'Ventes',
        data: ventes.value.map(v => v.total),
        borderColor: '#ff6600',
        tension: 0.4
      }]
    }));

    const paiementsData = computed(() => {
      const modes = {};
      ventes.value.forEach(vente => {
        modes[vente.mode_paiement] = (modes[vente.mode_paiement] || 0) + vente.total;
      });

      return {
        labels: Object.keys(modes),
        datasets: [{
          data: Object.values(modes),
          backgroundColor: [
            '#ff6600',
            '#28a745',
            '#007bff',
            '#ffc107',
            '#6c757d'
          ]
        }]
      };
    });

    const chartOptions = {
      ventes: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      },
      paiements: {
        responsive: true,
        maintainAspectRatio: false
      }
    };

    // Méthodes
    const loadData = async () => {
      try {
        const params = {};
        let weekStart, monthStart;

        switch (selectedPeriod.value) {
          case 'day':
            params.date = new Date().toISOString().split('T')[0];
            break;
          case 'week':
            weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            params.start = weekStart.toISOString().split('T')[0];
            params.end = new Date().toISOString().split('T')[0];
            break;
          case 'month':
            monthStart = new Date();
            monthStart.setDate(1);
            params.start = monthStart.toISOString().split('T')[0];
            params.end = new Date().toISOString().split('T')[0];
            break;
          case 'custom':
            params.start = dateRange.value.start;
            params.end = dateRange.value.end;
            break;
        }

        const [ventesRes, statsRes] = await Promise.all([
          api.get('/ventes', { params }),
          api.get('/stats/caisse', { params })
        ]);

        ventes.value = ventesRes.data;
        stats.value = statsRes.data;
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors du chargement des données'
        });
      }
    };

    const changePeriod = (period) => {
      selectedPeriod.value = period;
      loadData();
    };

    const exportExcel = async () => {
      try {
        const response = await api.get('/stats/caisse/export/excel', {
          params: {
            period: selectedPeriod.value,
            ...dateRange.value
          },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `stats_caisse_${new Date().toISOString().split('T')[0]}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'export Excel'
        });
      }
    };

    const exportPDF = async () => {
      try {
        const response = await api.get('/stats/caisse/export/pdf', {
          params: {
            period: selectedPeriod.value,
            ...dateRange.value
          },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `stats_caisse_${new Date().toISOString().split('T')[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'export PDF'
        });
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(price);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('fr-FR');
    };

    const formatVariation = (variation) => {
      const sign = variation > 0 ? '+' : '';
      return `${sign}${variation.toFixed(2)}%`;
    };

    const getVariationClass = (variation) => {
      if (variation > 0) return 'text-success';
      if (variation < 0) return 'text-danger';
      return '';
    };

    // Lifecycle hooks
    onMounted(() => {
      loadData();
    });

    return {
      // État
      selectedPeriod,
      dateRange,
      ventes,
      stats,

      // Données de référence
      periods,

      // Computed
      today,
      totalVentes,
      totalTickets,
      totalRemises,
      ticketMoyen,
      ventesVariation,
      ticketsVariation,
      ticketMoyenVariation,
      pourcentageRemises,
      totalMontant,
      totalNet,
      ventesData,
      paiementsData,
      chartOptions,

      // Méthodes
      changePeriod,
      exportExcel,
      exportPDF,
      formatPrice,
      formatDate,
      formatDateTime,
      formatVariation,
      getVariationClass
    };
  }
};
</script>
  
  <style scoped>
  .stats-caisse {
    padding: 2rem;
  }
  
  .filters-section {
    margin-bottom: 2rem;
  }
  
  .period-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .period-btn {
    padding: 0.75rem 1.5rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .period-btn.active {
    border-color: #ff6600;
    background: #fff5eb;
    color: #ff6600;
  }
  
  .date-range {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .date-input {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  
  .kpis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .kpi-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .kpi-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #ff6600;
  }
  
  .kpi-content h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .kpi-content p {
    margin: 0.25rem 0;
    color: #6c757d;
  }
  
  .kpi-content small {
    font-size: 0.875rem;
  }
  
  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .chart-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .chart-card h3 {
    margin-bottom: 1rem;
  }
  
  .sales-table {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .table-actions {
    display: flex;
    gap: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  th {
    background: #f8f9fa;
    font-weight: 500;
  }
  
  .remise {
    color: #dc3545;
  }
  
  tfoot {
    font-weight: 500;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-secondary {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
  }
  
  .text-success {
    color: #28a745;
  }
  
  .text-danger {
    color: #dc3545;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .stats-caisse {
      padding: 1rem;
    }
  
    .period-selector {
      flex-wrap: wrap;
    }
  
    .date-range {
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .table-header {
      flex-direction: column;
      gap: 1rem;
    }
  
    .table-actions {
      width: 100%;
    }
  
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>
  