<template>
  <div class="rapports-caisse">
    <!-- En-tête avec filtres -->
    <div class="header-section">
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

      <div class="date-selector">
        <template v-if="selectedPeriod === 'custom'">
          <div class="date-range">
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
        </template>
        <template v-else-if="selectedPeriod === 'month'">
          <input
            type="month"
            v-model="selectedMonth"
            :max="currentMonth"
            class="month-input"
          >
        </template>
      </div>

      <div class="report-actions">
        <button
          class="btn-secondary"
          @click="exportPDF"
        >
          <i class="fas fa-file-pdf"></i>
          Exporter PDF
        </button>
        <button
          class="btn-secondary"
          @click="exportExcel"
        >
          <i class="fas fa-file-excel"></i>
          Exporter Excel
        </button>
        <button
          class="btn-primary"
          @click="print"
        >
          <i class="fas fa-print"></i>
          Imprimer
        </button>
      </div>
    </div>

    <!-- Résumé -->
    <div class="summary-section">
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-cash-register"></i>
        </div>
        <div class="card-content">
          <h3>{{ formatPrice(totalVentes) }}</h3>
          <p>Chiffre d'affaires</p>
          <small :class="getVariationClass(ventesVariation)">
            {{ formatVariation(ventesVariation) }} vs période précédente
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <div class="card-content">
          <h3>{{ totalTickets }}</h3>
          <p>Tickets émis</p>
          <small :class="getVariationClass(ticketsVariation)">
            {{ formatVariation(ticketsVariation) }} vs période précédente
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-calculator"></i>
        </div>
        <div class="card-content">
          <h3>{{ formatPrice(ticketMoyen) }}</h3>
          <p>Ticket moyen</p>
          <small :class="getVariationClass(ticketMoyenVariation)">
            {{ formatVariation(ticketMoyenVariation) }} vs période précédente
          </small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="card-content">
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

    <!-- Détails -->
    <div class="details-section">
      <div class="details-header">
        <h3>Détail des opérations</h3>
        <div class="details-filters">
          <select v-model="filterType" class="filter-select">
            <option value="">Tous les types</option>
            <option value="vente">Ventes</option>
            <option value="remise">Remises</option>
            <option value="avoir">Avoirs</option>
          </select>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher..."
            >
          </div>
        </div>
      </div>

      <div class="details-table">
        <table>
          <thead>
            <tr>
              <th>Date/Heure</th>
              <th>Référence</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Montant</th>
              <th>Remise</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="operation in filteredOperations" :key="operation.id">
              <td>{{ formatDateTime(operation.date) }}</td>
              <td>{{ operation.reference }}</td>
              <td>
                <span
                  class="operation-type"
                  :class="getOperationTypeClass(operation.type)"
                >
                  {{ operation.type }}
                </span>
              </td>
              <td>{{ operation.mode_paiement }}</td>
              <td>{{ formatPrice(operation.montant) }}</td>
              <td>
                <span v-if="operation.remise" class="remise">
                  -{{ formatPrice(operation.remise) }}
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ formatPrice(operation.total) }}</td>
              <td>
                <button
                  class="btn-icon"
                  @click="voirDetails(operation)"
                  title="Voir détails"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="btn-icon"
                  @click="imprimerTicket(operation)"
                  title="Imprimer ticket"
                >
                  <i class="fas fa-print"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total</td>
              <td>{{ formatPrice(totalMontant) }}</td>
              <td>-{{ formatPrice(totalRemises) }}</td>
              <td>{{ formatPrice(totalNet) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal de détails -->
    <div class="modal" :class="{ 'show': showDetailsModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Détails de l'opération #{{ selectedOperation?.reference }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeDetailsModal"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedOperation">
            <div class="operation-details">
              <div class="detail-row">
                <span class="label">Date:</span>
                <span>{{ formatDateTime(selectedOperation.date) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span>{{ selectedOperation.type }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Mode de paiement:</span>
                <span>{{ selectedOperation.mode_paiement }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Caissier:</span>
                <span>{{ selectedOperation.caissier }}</span>
              </div>
            </div>

            <div class="items-section">
              <h6>Articles</h6>
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Qté</th>
                    <th>P.U.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOperation.items" :key="item.id">
                    <td>{{ item.designation }}</td>
                    <td>{{ item.quantite }}</td>
                    <td>{{ formatPrice(item.prix) }}</td>
                    <td>{{ formatPrice(item.prix * item.quantite) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="totals-section">
              <div class="total-row">
                <span>Sous-total:</span>
                <span>{{ formatPrice(selectedOperation.montant) }}</span>
              </div>
              <div class="total-row" v-if="selectedOperation.remise">
                <span>Remise:</span>
                <span>-{{ formatPrice(selectedOperation.remise) }}</span>
              </div>
              <div class="total-row">
                <span>Total:</span>
                <span>{{ formatPrice(selectedOperation.total) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn-secondary"
              @click="closeDetailsModal"
            >
              Fermer
            </button>
            <button
              type="button"
              class="btn-primary"
              @click="imprimerTicket(selectedOperation)"
            >
              <i class="fas fa-print"></i>
              Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Line, Pie } from 'vue-chartjs';
import api from '@/utils/api';

export default {
  name: 'RapportsCaisse',

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
    const selectedMonth = ref(new Date().toISOString().slice(0, 7));
    const filterType = ref('');
    const searchQuery = ref('');
    const operations = ref([]);
    const showDetailsModal = ref(false);
    const selectedOperation = ref(null);

    // Données de référence
    const periods = [
      { value: 'day', label: 'Jour', icon: 'fas fa-calendar-day' },
      { value: 'week', label: 'Semaine', icon: 'fas fa-calendar-week' },
      { value: 'month', label: 'Mois', icon: 'fas fa-calendar-alt' },
      { value: 'custom', label: 'Personnalisé', icon: 'fas fa-calendar-plus' }
    ];

    // Computed
    const today = computed(() => new Date().toISOString().split('T')[0]);
    const currentMonth = computed(() => new Date().toISOString().slice(0, 7));

    const filteredOperations = computed(() => {
      return operations.value.filter(op => {
        const matchType = !filterType.value || op.type === filterType.value;
        const matchQuery = !searchQuery.value ||
          op.reference.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchType && matchQuery;
      });
    });

    const totalMontant = computed(() => {
      return filteredOperations.value.reduce((sum, op) => sum + op.montant, 0);
    });

    const totalRemises = computed(() => {
      return filteredOperations.value.reduce((sum, op) => sum + (op.remise || 0), 0);
    });

    const totalNet = computed(() => {
      return totalMontant.value - totalRemises.value;
    });

    const pourcentageRemises = computed(() => {
      if (totalMontant.value === 0) return 0;
      return ((totalRemises.value / totalMontant.value) * 100).toFixed(2);
    });

    // Méthodes
    const loadData = async () => {
      try {
        const params = {};

        switch (selectedPeriod.value) {
          case 'day': {
            const date = new Date().toISOString().split('T')[0];
            params.date = date;
            break;
          }
          case 'week': {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const start = weekStart.toISOString().split('T')[0];
            const end = new Date().toISOString().split('T')[0];
            params.start = start;
            params.end = end;
            break;
          }
          case 'month': {
            params.month = selectedMonth.value;
            break;
          }
          case 'custom': {
            const { start, end } = dateRange.value;
            params.start = start;
            params.end = end;
            break;
          }
        }

        const response = await api.get('/rapports/caisse', { params });
        operations.value = response.data;
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

    const voirDetails = (operation) => {
      selectedOperation.value = operation;
      showDetailsModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedOperation.value = null;
    };

    const imprimerTicket = async (operation) => {
      try {
        const response = await api.get(
          `/tickets/${operation.id}/print`,
          { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `ticket_${operation.reference}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'impression'
        });
      }
    };

    const exportPDF = async () => {
      try {
        const response = await api.get('/rapports/caisse/export/pdf', {
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
          `rapport_caisse_${new Date().toISOString().split('T')[0]}.pdf`
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

    const exportExcel = async () => {
      try {
        const response = await api.get('/rapports/caisse/export/excel', {
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
          `rapport_caisse_${new Date().toISOString().split('T')[0]}.xlsx`
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

    const print = () => {
      window.print();
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(price);
    };

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    };

    const getOperationTypeClass = (type) => {
      const classes = {
        'vente': 'type-vente',
        'remise': 'type-remise',
        'avoir': 'type-avoir'
      };
      return classes[type] || '';
    };

    const getVariationClass = (variation) => {
      if (variation > 0) return 'text-success';
      if (variation < 0) return 'text-danger';
      return 'text-warning';
    };

    const formatVariation = (variation) => {
      const sign = variation > 0 ? '+' : '';
      return `${sign}${variation.toFixed(2)}%`;
    };

    // Lifecycle hooks
    onMounted(() => {
      loadData();
    });

    return {
      // État
      selectedPeriod,
      dateRange,
      selectedMonth,
      filterType,
      searchQuery,
      operations,
      showDetailsModal,
      selectedOperation,

      // Données de référence
      periods,

      // Computed
      today,
      currentMonth,
      filteredOperations,
      totalMontant,
      totalRemises,
      totalNet,
      pourcentageRemises,

      // Méthodes
      changePeriod,
      voirDetails,
      closeDetailsModal,
      imprimerTicket,
      exportPDF,
      exportExcel,
      print,
      formatPrice,
      formatDateTime,
      getOperationTypeClass,
      getVariationClass,
      formatVariation
    };
  }
};
</script>

<style scoped>
.rapports-caisse {
  padding: 2rem;
}

.header-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
}

.period-btn {
  padding: 0.75rem 1rem;
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

.date-selector {
  display: flex;
  gap: 1rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input,
.month-input {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.report-actions {
  display: flex;
  gap: 0.5rem;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
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

.card-content h3 {
  margin: 0;
  font-size: 1.5rem;
}

.card-content p {
  margin: 0.25rem 0;
  color: #6c757d;
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

.details-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.details-filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 300px;
}

.details-table {
  overflow-x: auto;
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

.operation-type {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.type-vente {
  background: #d1e7dd;
  color: #0f5132;
}

.type-remise {
  background: #f8d7da;
  color: #842029;
}

.type-avoir {
  background: #cfe2ff;
  color: #084298;
}

.remise {
  color: #dc3545;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
}

/* Modal styles */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  width: 100%;
  max-width: 600px;
  margin: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.operation-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #6c757d;
}

.items-section {
  margin-bottom: 1.5rem;
}

.totals-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .period-selector {
    width: 100%;
    overflow-x: auto;
  }

  .date-selector {
    width: 100%;
  }

  .report-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .rapports-caisse {
    padding: 1rem;
  }

  .details-header {
    flex-direction: column;
    gap: 1rem;
  }

  .details-filters {
    width: 100%;
    flex-direction: column;
  }

  .search-box input {
    width: 100%;
  }
}

@media print {
  .header-section,
  .report-actions,
  .details-filters,
  .btn-icon {
    display: none;
  }

  .rapports-caisse {
    padding: 0;
  }

  .summary-section,
  .charts-section,
  .details-section {
    break-inside: avoid;
  }
}
</style>
