<template>
  <div class="ticket-manager">
    <!-- En-tête avec recherche et filtres -->
    <div class="header-section">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un ticket..."
          >
        </div>
        <div class="filters">
          <select v-model="filterStatus" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Payé">Payé</option>
            <option value="Avoir">Avoir</option>
          </select>
          <select v-model="filterDate" class="filter-select">
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
          <div v-if="filterDate === 'custom'" class="date-range">
            <input
              type="date"
              v-model="dateRange.start"
              class="date-input"
            >
            <span>à</span>
            <input
              type="date"
              v-model="dateRange.end"
              class="date-input"
            >
          </div>
        </div>
      </div>
      <div class="actions">
        <button
          class="btn-primary"
          @click="printDayReport"
        >
          <i class="fas fa-print"></i>
          Rapport du jour
        </button>
      </div>
    </div>

    <!-- Liste des tickets -->
    <div class="tickets-container">
      <div class="tickets-list">
        <div
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          class="ticket-card"
          :class="[
            getTicketStatusClass(ticket.etat),
            { selected: selectedTicket?.id === ticket.id }
          ]"
          @click="selectTicket(ticket)"
        >
          <div class="ticket-header">
            <div class="ticket-info">
              <span class="ticket-ref">#{{ ticket.reference }}</span>
              <span
                class="status-badge"
                :class="getTicketStatusClass(ticket.etat)"
              >
                {{ ticket.etat }}
              </span>
            </div>
            <div class="ticket-time">
              {{ formatTime(ticket.created_at) }}
            </div>
          </div>

          <div class="ticket-content">
            <div class="table-info">
              <i class="fas fa-chair"></i>
              Table {{ ticket.table.nom }}
              <span class="salle-name">({{ ticket.table.salle.nom }})</span>
            </div>
            <div class="items-summary">
              {{ getItemsSummary(ticket.items) }}
            </div>
            <div class="ticket-total">
              Total: {{ formatPrice(getTicketTotal(ticket)) }}
            </div>
          </div>

          <div class="ticket-footer">
            <div class="payment-info" v-if="ticket.paiement">
              <i :class="getPaymentIcon(ticket.paiement.mode)"></i>
              {{ ticket.paiement.mode }}
            </div>
            <div class="avoir-info" v-if="ticket.avoir">
              <i class="fas fa-receipt"></i>
              Avoir: {{ formatPrice(ticket.avoir.montant) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Détails du ticket sélectionné -->
      <div
        class="ticket-details"
        :class="{ 'show': selectedTicket }"
      >
        <div v-if="selectedTicket" class="details-content">
          <div class="details-header">
            <h3>Ticket #{{ selectedTicket.reference }}</h3>
            <div class="header-actions">
              <button
                class="btn-icon"
                @click="printTicket"
                title="Imprimer"
              >
                <i class="fas fa-print"></i>
              </button>
              <button
                class="btn-icon"
                @click="selectedTicket = null"
                title="Fermer"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div class="details-body">
            <div class="ticket-info-section">
              <div class="info-row">
                <span class="label">Table:</span>
                <span>{{ selectedTicket.table.nom }}</span>
              </div>
              <div class="info-row">
                <span class="label">Salle:</span>
                <span>{{ selectedTicket.table.salle.nom }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span>{{ formatDateTime(selectedTicket.created_at) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Statut:</span>
                <span
                  class="status-badge"
                  :class="getTicketStatusClass(selectedTicket.etat)"
                >
                  {{ selectedTicket.etat }}
                </span>
              </div>
            </div>

            <div class="items-section">
              <h4>Articles commandés</h4>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Qté</th>
                    <th>Article</th>
                    <th>P.U.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedTicket.items" :key="item.id">
                    <td>{{ item.quantite }}</td>
                    <td>{{ item.designation }}</td>
                    <td>{{ formatPrice(item.prix) }}</td>
                    <td>{{ formatPrice(item.prix * item.quantite) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-right">Total:</td>
                    <td>{{ formatPrice(getTicketTotal(selectedTicket)) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div v-if="selectedTicket.paiement" class="payment-section">
              <h4>Paiement</h4>
              <div class="payment-details">
                <div class="payment-row">
                  <span class="label">Mode:</span>
                  <span>{{ selectedTicket.paiement.mode }}</span>
                </div>
                <div class="payment-row">
                  <span class="label">Montant reçu:</span>
                  <span>{{ formatPrice(selectedTicket.paiement.montant_recu) }}</span>
                </div>
                <div class="payment-row">
                  <span class="label">Monnaie rendue:</span>
                  <span>{{ formatPrice(selectedTicket.paiement.monnaie) }}</span>
                </div>
                <div class="payment-row">
                  <span class="label">Date:</span>
                  <span>{{ formatDateTime(selectedTicket.paiement.date_paiement) }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedTicket.avoir" class="avoir-section">
              <h4>Avoir</h4>
              <div class="avoir-details">
                <div class="avoir-row">
                  <span class="label">Montant:</span>
                  <span>{{ formatPrice(selectedTicket.avoir.montant) }}</span>
                </div>
                <div class="avoir-row">
                  <span class="label">Date d'émission:</span>
                  <span>{{ formatDateTime(selectedTicket.avoir.date_emission) }}</span>
                </div>
                <div class="avoir-row">
                  <span class="label">Statut:</span>
                  <span class="status-badge">
                    {{ selectedTicket.avoir.utilise ? 'Utilisé' : 'Non utilisé' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="actions-section">
              <button
                v-if="canProcessPayment"
                class="btn-primary"
                @click="processPayment"
              >
                <i class="fas fa-cash-register"></i>
                Encaisser
              </button>
              <button
                v-if="canCreateAvoir"
                class="btn-secondary"
                @click="createAvoir"
              >
                <i class="fas fa-receipt"></i>
                Créer un avoir
              </button>
              <button
                v-if="canCancelTicket"
                class="btn-danger"
                @click="cancelTicket"
              >
                <i class="fas fa-times"></i>
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création d'avoir -->
    <div class="modal" :class="{ 'show': showAvoirModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Création d'un avoir</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeAvoirModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Montant</label>
              <input
                type="number"
                v-model.number="avoirForm.montant"
                class="form-control"
                :max="getTicketTotal(selectedTicket)"
              >
            </div>
            <div class="form-group">
              <label>Motif</label>
              <textarea
                v-model="avoirForm.motif"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn-secondary"
              @click="closeAvoirModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="btn-primary"
              @click="saveAvoir"
              :disabled="!canSaveAvoir"
            >
              Créer l'avoir
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
import { useRouter } from 'vue-router';
import api from '@/utils/api';

export default {
  name: 'TicketManager',

  setup() {
    const store = useStore();
    const router = useRouter();

    // État
    const tickets = ref([]);
    const selectedTicket = ref(null);
    const searchQuery = ref('');
    const filterStatus = ref('');
    const filterDate = ref('today');
    const dateRange = ref({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
    const showAvoirModal = ref(false);
    const avoirForm = ref({
      montant: 0,
      motif: ''
    });

    // Computed
    const filteredTickets = computed(() => {
      return tickets.value.filter(ticket => {
        const matchQuery = ticket.reference.toLowerCase()
          .includes(searchQuery.value.toLowerCase());
        const matchStatus = !filterStatus.value ||
          ticket.etat === filterStatus.value;
        const matchDate = isTicketInDateRange(ticket);
        return matchQuery && matchStatus && matchDate;
      });
    });

    const canProcessPayment = computed(() => {
      return selectedTicket.value &&
        selectedTicket.value.etat === 'En attente';
    });

    const canCreateAvoir = computed(() => {
      return selectedTicket.value &&
        selectedTicket.value.etat === 'Payé' &&
        !selectedTicket.value.avoir;
    });

    const canCancelTicket = computed(() => {
      return selectedTicket.value &&
        selectedTicket.value.etat === 'En attente';
    });

    const canSaveAvoir = computed(() => {
      return avoirForm.value.montant > 0 &&
        avoirForm.value.montant <= getTicketTotal(selectedTicket.value) &&
        avoirForm.value.motif.trim();
    });

    // Méthodes
    const loadTickets = async () => {
      try {
        const response = await api.get('/tickets');
        tickets.value = response.data;
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors du chargement des tickets'
        });
      }
    };

    const selectTicket = (ticket) => {
      selectedTicket.value = ticket;
    };

    const isTicketInDateRange = (ticket) => {
      const ticketDate = new Date(ticket.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let start, end;

      switch (filterDate.value) {
        case 'today':
          return ticketDate >= today;
        case 'week': {
          start = new Date(today);
          start.setDate(today.getDate() - today.getDay());
          return ticketDate >= start;
        }
        case 'month': {
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          return ticketDate >= start;
        }
        case 'custom': {
          start = new Date(dateRange.value.start);
          end = new Date(dateRange.value.end);
          end.setHours(23, 59, 59, 999);
          return ticketDate >= start && ticketDate <= end;
        }
        default:
          return true;
      }
    };

    const getTicketTotal = (ticket) => {
      if (!ticket) return 0;
      return ticket.items.reduce((total, item) => {
        return total + (item.prix * item.quantite);
      }, 0);
    };

    const getItemsSummary = (items) => {
      const total = items.reduce((sum, item) => sum + item.quantite, 0);
      return `${total} article${total > 1 ? 's' : ''}`;
    };

    const processPayment = () => {
      router.push({
        name: 'payment',
        params: { ticketId: selectedTicket.value.id }
      });
    };

    const createAvoir = () => {
      avoirForm.value = {
        montant: getTicketTotal(selectedTicket.value),
        motif: ''
      };
      showAvoirModal.value = true;
    };

    const closeAvoirModal = () => {
      showAvoirModal.value = false;
      avoirForm.value = {
        montant: 0,
        motif: ''
      };
    };

    const saveAvoir = async () => {
      try {
        await api.post('/avoirs', {
          ticket_id: selectedTicket.value.id,
          montant: avoirForm.value.montant,
          motif: avoirForm.value.motif
        });

        await loadTickets();
        closeAvoirModal();

        store.dispatch('showNotification', {
          type: 'success',
          message: 'Avoir créé avec succès'
        });
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de la création de l\'avoir'
        });
      }
    };

    const cancelTicket = async () => {
      if (!confirm('Êtes-vous sûr de vouloir annuler ce ticket ?')) {
        return;
      }

      try {
        await api.put(`/tickets/${selectedTicket.value.id}/cancel`);
        await loadTickets();

        store.dispatch('showNotification', {
          type: 'success',
          message: 'Ticket annulé avec succès'
        });
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'annulation du ticket'
        });
      }
    };

    const printTicket = async () => {
      try {
        const response = await api.get(
          `/tickets/${selectedTicket.value.id}/print`,
          { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `ticket_${selectedTicket.value.reference}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'impression du ticket'
        });
      }
    };

    const printDayReport = async () => {
      try {
        const response = await api.get('/tickets/report/day', {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `rapport_${new Date().toISOString().split('T')[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'impression du rapport'
        });
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(price);
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };

    const formatDateTime = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    const getTicketStatusClass = (etat) => {
      const classes = {
        'En attente': 'status-pending',
        'Payé': 'status-paid',
        'Annulé': 'status-cancelled'
      };
      return classes[etat] || '';
    };

    const getPaymentIcon = (mode) => {
      const icons = {
        'Espèces': 'fas fa-money-bill-wave',
        'Carte Bancaire': 'fas fa-credit-card',
        'Monnaie Électronique': 'fas fa-mobile-alt'
      };
      return icons[mode] || 'fas fa-money-bill';
    };

    // Lifecycle hooks
    onMounted(() => {
      loadTickets();
    });

    return {
      tickets,
      selectedTicket,
      searchQuery,
      filterStatus,
      filterDate,
      dateRange,
      showAvoirModal,
      avoirForm,
      filteredTickets,
      canProcessPayment,
      canCreateAvoir,
      canCancelTicket,
      canSaveAvoir,
      selectTicket,
      getTicketTotal,
      getItemsSummary,
      processPayment,
      createAvoir,
      closeAvoirModal,
      saveAvoir,
      cancelTicket,
      printTicket,
      printDayReport,
      formatPrice,
      formatTime,
      formatDateTime,
      getTicketStatusClass,
      getPaymentIcon
    };
  }
};
</script>

<style scoped>
.ticket-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filters {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.tickets-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1rem;
  overflow: hidden;
}

.tickets-list {
  overflow-y: auto;
  padding: 0.5rem;
}

.ticket-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ticket-card:hover {
  transform: translateY(-2px);
}

.ticket-card.selected {
  border: 2px solid #ff6600;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ticket-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ticket-ref {
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.ticket-time {
  color: #6c757d;
  font-size: 0.875rem;
}

.ticket-content {
  margin: 1rem 0;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.salle-name {
  color: #6c757d;
}

.items-summary {
  color: #6c757d;
  font-size: 0.875rem;
}

.ticket-total {
  font-weight: 500;
  color: #ff6600;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
}

.payment-info,
.avoir-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.ticket-details {
  background: white;
  border-radius: 12px;
  box-shadow: -2px 0 4px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.ticket-details.show {
  transform: translateX(0);
}

.details-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.details-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.ticket-info-section {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #6c757d;
}

.items-section {
  margin-bottom: 2rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.text-right {
  text-align: right;
}

.payment-section,
.avoir-section {
  margin-bottom: 2rem;
}

.payment-details,
.avoir-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.payment-row,
.avoir-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.actions-section {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Status colors */
.status-pending {
  background: #fff3cd;
  color: #664d03;
}

.status-paid {
  background: #d1e7dd;
  color: #0f5132;
}

.status-cancelled {
  background: #f8d7da;
  color: #842029;
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 1200px) {
  .tickets-container {
    grid-template-columns: 1fr;
  }

  .ticket-details {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    z-index: 1000;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .search-filters {
    flex-direction: column;
  }

  .filters {
    flex-wrap: wrap;
  }
}
</style>
