<template>
    <div class="journal-caisse">
      <div class="header-section">
        <h2>Journal des opérations</h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary"
            @click="exportJournal"
          >
            <i class="fas fa-file-export"></i>
            Exporter
          </button>
          <button 
            class="btn btn-primary"
            @click="refreshJournal"
          >
            <i class="fas fa-sync-alt"></i>
            Actualiser
          </button>
        </div>
      </div>
  
      <!-- Filtres -->
      <div class="filters-section">
        <div class="date-range">
          <div class="date-input">
            <label>Du</label>
            <input 
              type="date" 
              v-model="filters.dateDebut"
              :max="today"
            >
          </div>
          <div class="date-input">
            <label>Au</label>
            <input 
              type="date" 
              v-model="filters.dateFin"
              :max="today"
            >
          </div>
        </div>
  
        <div class="filters-group">
          <div class="filter-item">
            <label>Caisse</label>
            <select v-model="filters.caisse" class="form-select">
              <option value="">Toutes les caisses</option>
              <option 
                v-for="caisse in caisses"
                :key="caisse.id"
                :value="caisse.id"
              >
                {{ caisse.nom }}
              </option>
            </select>
          </div>
  
          <div class="filter-item">
            <label>Type d'opération</label>
            <select v-model="filters.type" class="form-select">
              <option value="">Tous types</option>
              <option 
                v-for="type in typesOperation"
                :key="type.code"
                :value="type.code"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
  
          <div class="filter-item">
            <label>Utilisateur</label>
            <select v-model="filters.utilisateur" class="form-select">
              <option value="">Tous utilisateurs</option>
              <option 
                v-for="user in utilisateurs"
                :key="user.id"
                :value="user.id"
              >
                {{ user.nom }}
              </option>
            </select>
          </div>
  
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="filters.search"
              placeholder="Rechercher..."
            >
          </div>
        </div>
      </div>
  
      <!-- Journal -->
      <div class="journal-content">
        <div class="timeline">
          <div 
            v-for="(group, date) in groupedOperations"
            :key="date"
            class="timeline-group"
          >
            <div class="timeline-date">
              <span>{{ formatDate(date) }}</span>
              <div class="date-summary">
                <span>{{ group.operations.length }} opérations</span>
                <span>Total: {{ formatPrice(group.total) }}</span>
              </div>
            </div>
  
            <div 
              v-for="operation in group.operations"
              :key="operation.id"
              class="timeline-item"
              :class="getOperationClass(operation.type)"
            >
              <div class="timeline-icon">
                <i :class="getOperationIcon(operation.type)"></i>
              </div>
  
              <div class="timeline-content">
                <div class="operation-header">
                  <div class="operation-info">
                    <span class="operation-time">{{ formatTime(operation.date) }}</span>
                    <span class="operation-type">{{ operation.type }}</span>
                    <span 
                      v-if="operation.reference"
                      class="operation-ref"
                    >
                      #{{ operation.reference }}
                    </span>
                  </div>
                  <div class="operation-amount">
                    <span :class="getAmountClass(operation)">
                      {{ formatPrice(operation.montant) }}
                    </span>
                  </div>
                </div>
  
                <div class="operation-details">
                  <div class="detail-row">
                    <span class="label">Caisse:</span>
                    <span>{{ operation.caisse.nom }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Utilisateur:</span>
                    <span>{{ operation.utilisateur.nom }}</span>
                  </div>
                  <div 
                    v-if="operation.mode_paiement"
                    class="detail-row"
                  >
                    <span class="label">Mode:</span>
                    <span>{{ operation.mode_paiement }}</span>
                  </div>
                </div>
  
                <div 
                  v-if="operation.commentaire"
                  class="operation-comment"
                >
                  {{ operation.commentaire }}
                </div>
  
                <div class="operation-actions">
                  <button 
                    v-if="operation.ticket_id"
                    class="btn-link"
                    @click="voirTicket(operation.ticket_id)"
                  >
                    <i class="fas fa-receipt"></i>
                    Voir le ticket
                  </button>
                  <button 
                    class="btn-link"
                    @click="voirDetails(operation)"
                  >
                    <i class="fas fa-info-circle"></i>
                    Détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Message si aucune opération -->
        <div v-if="!hasOperations" class="no-operations">
          <i class="fas fa-inbox"></i>
          <p>Aucune opération trouvée pour cette période</p>
        </div>
      </div>
  
      <!-- Modal de détails -->
      <div class="modal" :class="{ 'show': showDetails }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Détails de l'opération</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeDetails"
              ></button>
            </div>
            <div class="modal-body" v-if="selectedOperation">
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Type:</span>
                  <span>{{ selectedOperation.type }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Date:</span>
                  <span>{{ formatDateTime(selectedOperation.date) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Référence:</span>
                  <span>{{ selectedOperation.reference || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Montant:</span>
                  <span>{{ formatPrice(selectedOperation.montant) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Caisse:</span>
                  <span>{{ selectedOperation.caisse.nom }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Utilisateur:</span>
                  <span>{{ selectedOperation.utilisateur.nom }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Mode de paiement:</span>
                  <span>{{ selectedOperation.mode_paiement || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Statut:</span>
                  <span>{{ selectedOperation.statut }}</span>
                </div>
              </div>
  
              <div v-if="selectedOperation.commentaire" class="detail-comment">
                <span class="label">Commentaire:</span>
                <p>{{ selectedOperation.commentaire }}</p>
              </div>
  
              <div v-if="selectedOperation.historique?.length" class="detail-history">
                <h6>Historique</h6>
                <div 
                  v-for="(event, index) in selectedOperation.historique"
                  :key="index"
                  class="history-item"
                >
                  <div class="history-time">
                    {{ formatDateTime(event.date) }}
                  </div>
                  <div class="history-content">
                    <strong>{{ event.utilisateur }}:</strong>
                    {{ event.action }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeDetails"
              >
                Fermer
              </button>
              <button 
                v-if="selectedOperation?.ticket_id"
                type="button" 
                class="btn btn-primary"
                @click="voirTicket(selectedOperation.ticket_id)"
              >
                Voir le ticket
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
    name: 'JournalCaisse',
  
    setup() {
      const store = useStore();
      const router = useRouter();
  
      // État
      const operations = ref([]);
      const caisses = ref([]);
      const utilisateurs = ref([]);
      const filters = ref({
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: new Date().toISOString().split('T')[0],
        caisse: '',
        type: '',
        utilisateur: '',
        search: ''
      });
      const showDetails = ref(false);
      const selectedOperation = ref(null);
  
      // Données de référence
      const typesOperation = [
        { code: 'OUVERTURE', label: 'Ouverture de caisse' },
        { code: 'FERMETURE', label: 'Fermeture de caisse' },
        { code: 'ENCAISSEMENT', label: 'Encaissement' },
        { code: 'ANNULATION', label: 'Annulation' },
        { code: 'REMISE', label: 'Remise' },
        { code: 'AVOIR', label: 'Avoir' },
        { code: 'TRANSFERT', label: 'Transfert' }
      ];
  
      // Computed
      const today = computed(() => new Date().toISOString().split('T')[0]);
  
      const filteredOperations = computed(() => {
        return operations.value.filter(op => {
          const matchCaisse = !filters.value.caisse || 
            op.caisse.id === filters.value.caisse;
          const matchType = !filters.value.type || 
            op.type === filters.value.type;
          const matchUser = !filters.value.utilisateur || 
            op.utilisateur.id === filters.value.utilisateur;
          const matchSearch = !filters.value.search || 
            op.reference?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            op.commentaire?.toLowerCase().includes(filters.value.search.toLowerCase());
          return matchCaisse && matchType && matchUser && matchSearch;
        });
      });
  
      const groupedOperations = computed(() => {
        const groups = {};
        filteredOperations.value.forEach(op => {
          const date = op.date.split('T')[0];
          if (!groups[date]) {
            groups[date] = {
              operations: [],
              total: 0
            };
          }
          groups[date].operations.push(op);
          groups[date].total += op.montant;
        });
        return groups;
      });
  
      const hasOperations = computed(() => {
        return Object.keys(groupedOperations.value).length > 0;
      });
  
      // Méthodes
      const loadData = async () => {
        try {
          const [opsRes, caissesRes, usersRes] = await Promise.all([
            api.get('/operations', { 
              params: {
                date_debut: filters.value.dateDebut,
                date_fin: filters.value.dateFin
              }
            }),
            api.get('/caisses'),
            api.get('/utilisateurs')
          ]);
  
          operations.value = opsRes.data;
          caisses.value = caissesRes.data;
          utilisateurs.value = usersRes.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des données'
          });
        }
      };
  
      const refreshJournal = () => {
        loadData();
      };
  
      const exportJournal = async () => {
        try {
          const response = await api.get('/operations/export', {
            params: {
              ...filters.value,
              format: 'excel'
            },
            responseType: 'blob'
          });
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `journal_caisse_${filters.value.dateDebut}_${filters.value.dateFin}.xlsx`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'export'
          });
        }
      };
  
      const voirTicket = (ticketId) => {
        router.push(`/caisse/tickets/${ticketId}`);
      };
  
      const voirDetails = (operation) => {
        selectedOperation.value = operation;
        showDetails.value = true;
      };
  
      const closeDetails = () => {
        showDetails.value = false;
        selectedOperation.value = null;
      };
  
      const getOperationClass = (type) => {
        const classes = {
          'OUVERTURE': 'type-ouverture',
          'FERMETURE': 'type-fermeture',
          'ENCAISSEMENT': 'type-encaissement',
          'ANNULATION': 'type-annulation',
          'REMISE': 'type-remise',
          'AVOIR': 'type-avoir',
          'TRANSFERT': 'type-transfert'
        };
        return classes[type] || '';
      };
  
      const getOperationIcon = (type) => {
        const icons = {
          'OUVERTURE': 'fas fa-door-open',
          'FERMETURE': 'fas fa-door-closed',
          'ENCAISSEMENT': 'fas fa-cash-register',
          'ANNULATION': 'fas fa-ban',
          'REMISE': 'fas fa-percent',
          'AVOIR': 'fas fa-receipt',
          'TRANSFERT': 'fas fa-exchange-alt'
        };
        return icons[type] || 'fas fa-circle';
      };
  
      const getAmountClass = (operation) => {
        if (['ENCAISSEMENT'].includes(operation.type)) {
          return 'amount-positive';
        }
        if (['ANNULATION', 'REMISE', 'AVOIR'].includes(operation.type)) {
          return 'amount-negative';
        }
        return '';
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
  
      const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      const formatDateTime = (date) => {
        return new Date(date).toLocaleString('fr-FR');
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadData();
      });
  
      return {
        operations,
        caisses,
        utilisateurs,
        filters,
        showDetails,
        selectedOperation,
        typesOperation,
        today,
        filteredOperations,
        groupedOperations,
        hasOperations,
        refreshJournal,
        exportJournal,
        voirTicket,
        voirDetails,
        closeDetails,
        getOperationClass,
        getOperationIcon,
        getAmountClass,
        formatPrice,
        formatDate,
        formatTime,
        formatDateTime
      };
    }
  };
  </script>
  
  <style scoped>
  .journal-caisse {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
  }
  
  .filters-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }
  
  .date-range {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .date-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .date-input label {
    font-weight: 500;
  }
  
  .date-input input {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  
  .filters-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-item label {
    font-weight: 500;
  }
  
  .form-select {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
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
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  
  .journal-content {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .timeline {
    position: relative;
  }
  
  .timeline-group {
    margin-bottom: 2rem;
  }
  
  .timeline-date {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .date-summary {
    display: flex;
    gap: 1rem;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .timeline-item {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    border-left: 4px solid #dee2e6;
    margin-left: 2rem;
    position: relative;
  }
  
  .timeline-icon {
    position: absolute;
    left: -1.25rem;
    width: 2.5rem;
    height: 2.5rem;
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .timeline-content {
    flex: 1;
  }
  
  .operation-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }
  
  .operation-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .operation-time {
    color: #6c757d;
  }
  
  .operation-type {
    font-weight: 500;
  }
  
  .operation-ref {
    color: #6c757d;
  }
  
  .operation-amount {
    font-size: 1.25rem;
    font-weight: 500;
  }
  
  .amount-positive {
    color: #28a745;
  }
  
  .amount-negative {
    color: #dc3545;
  }
  
  .operation-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .detail-row {
    display: flex;
    gap: 0.5rem;
  }
  
  .label {
    color: #6c757d;
  }
  
  .operation-comment {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .operation-actions {
    display: flex;
    gap: 1rem;
  }
  
  .btn-link {
    padding: 0;
    border: none;
    background: none;
    color: #ff6600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* Types d'opérations */
  .type-ouverture .timeline-icon {
    color: #28a745;
    border-color: #28a745;
  }
  
  .type-fermeture .timeline-icon {
    color: #6c757d;
    border-color: #6c757d;
  }
  
  .type-encaissement .timeline-icon {
    color: #28a745;
    border-color: #28a745;
  }
  
  .type-annulation .timeline-icon {
    color: #dc3545;
    border-color: #dc3545;
  }
  
  .type-remise .timeline-icon {
    color: #ffc107;
    border-color: #ffc107;
  }
  
  .type-avoir .timeline-icon {
    color: #17a2b8;
    border-color: #17a2b8;
  }
  
  .type-transfert .timeline-icon {
    color: #6610f2;
    border-color: #6610f2;
  }
  
  .no-operations {
    text-align: center;
    padding: 4rem;
  }
  
  .no-operations i {
    font-size: 3rem;
    color: #dee2e6;
    margin-bottom: 1rem;
  }
  
  .no-operations p {
    color: #6c757d;
    margin: 0;
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
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .detail-comment {
    margin-bottom: 1.5rem;
  }
  
  .detail-history {
    border-top: 1px solid #dee2e6;
    padding-top: 1.5rem;
  }
  
  .history-item {
    margin-bottom: 1rem;
  }
  
  .history-time {
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
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
  
  .btn-primary {
    background: #ff6600;
    color: white;
  }
  
  .btn-secondary {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .journal-caisse {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
    }
  
    .header-actions {
      width: 100%;
    }
  
    .header-actions .btn {
      flex: 1;
    }
  
    .date-range {
      flex-direction: column;
      gap: 1rem;
    }
  
    .timeline-item {
      margin-left: 1rem;
    }
  
    .operation-header {
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .operation-info {
      flex-wrap: wrap;
    }
  }
  </style>
  