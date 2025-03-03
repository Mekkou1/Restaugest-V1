<template>
    <div class="cloture-caisse">
      <div class="header-section">
        <h2>Clôture de caisse</h2>
        <div class="caisse-info">
          <span class="label">Caisse:</span>
          <span class="value">{{ caisse.nom }}</span>
          <span 
            class="status-badge"
            :class="getCaisseStatusClass(caisse.etat)"
          >
            {{ caisse.etat }}
          </span>
        </div>
      </div>
  
      <!-- Résumé de la journée -->
      <div class="summary-section">
        <div class="summary-card">
          <div class="card-header">
            <h3>Résumé de la journée</h3>
            <span class="date">{{ formatDate(new Date()) }}</span>
          </div>
          <div class="card-content">
            <div class="summary-row">
              <span>Fonds initial:</span>
              <span>{{ formatPrice(fondsInitial) }}</span>
            </div>
            <div class="summary-row">
              <span>Total encaissements:</span>
              <span class="text-success">{{ formatPrice(totalEncaissements) }}</span>
            </div>
            <div class="summary-row">
              <span>Total décaissements:</span>
              <span class="text-danger">{{ formatPrice(totalDecaissements) }}</span>
            </div>
            <div class="summary-row total">
              <span>Solde théorique:</span>
              <span>{{ formatPrice(soldeTheorique) }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Comptage des espèces -->
      <div class="counting-section">
        <h3>Comptage des espèces</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Coupure</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(billet, index) in billetage" :key="index">
              <td>{{ formatPrice(billet.coupure) }}</td>
              <td>
                <input 
                  type="number" 
                  v-model.number="billet.quantite"
                  class="form-control"
                  min="0"
                  @input="updateTotals"
                >
              </td>
              <td>{{ formatPrice(billet.coupure * billet.quantite) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">Total comptage</td>
              <td>{{ formatPrice(totalComptage) }}</td>
            </tr>
            <tr>
              <td colspan="2">Écart</td>
              <td :class="getEcartClass">{{ formatPrice(ecart) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
  
      <!-- Détail des opérations -->
      <div class="operations-section">
        <div class="section-header">
          <h3>Détail des opérations</h3>
          <div class="filters">
            <select v-model="filterType" class="form-select">
              <option value="">Tous types</option>
              <option value="encaissement">Encaissements</option>
              <option value="decaissement">Décaissements</option>
            </select>
            <select v-model="filterMode" class="form-select">
              <option value="">Tous modes</option>
              <option value="especes">Espèces</option>
              <option value="cb">Carte bancaire</option>
              <option value="mobile">Mobile money</option>
            </select>
          </div>
        </div>
  
        <table class="table">
          <thead>
            <tr>
              <th>Heure</th>
              <th>Référence</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="operation in filteredOperations" :key="operation.id">
              <td>{{ formatTime(operation.date) }}</td>
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
              <td :class="operation.type === 'encaissement' ? 'text-success' : 'text-danger'">
                {{ operation.type === 'encaissement' ? '+' : '-' }}{{ formatPrice(operation.montant) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Actions -->
      <div class="actions-section">
        <div class="commentaire-section">
          <label>Commentaire de clôture</label>
          <textarea 
            v-model="commentaire"
            class="form-control"
            rows="3"
            placeholder="Observations, remarques..."
          ></textarea>
        </div>
  
        <div class="buttons-section">
          <button 
            class="btn btn-secondary"
            @click="imprimerBilan"
          >
            <i class="fas fa-print"></i>
            Imprimer le bilan
          </button>
          <button 
            class="btn btn-primary"
            @click="cloturerCaisse"
            :disabled="!canCloturer"
          >
            <i class="fas fa-lock"></i>
            Clôturer la caisse
          </button>
        </div>
      </div>
  
      <!-- Modal de confirmation -->
      <div class="modal" :class="{ 'show': showConfirmation }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmer la clôture</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="showConfirmation = false"
              ></button>
            </div>
            <div class="modal-body">
              <div class="confirmation-details">
                <div class="detail-row">
                  <span>Solde théorique:</span>
                  <span>{{ formatPrice(soldeTheorique) }}</span>
                </div>
                <div class="detail-row">
                  <span>Solde réel:</span>
                  <span>{{ formatPrice(totalComptage) }}</span>
                </div>
                <div class="detail-row">
                  <span>Écart:</span>
                  <span :class="getEcartClass">{{ formatPrice(ecart) }}</span>
                </div>
              </div>
              <p class="confirmation-message">
                Êtes-vous sûr de vouloir clôturer la caisse ?<br>
                Cette action est irréversible.
              </p>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="showConfirmation = false"
              >
                Annuler
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="confirmerCloture"
              >
                Confirmer la clôture
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
  import api from '@/utils/api';
  
  export default {
    name: 'ClotureCaisse',
  
    props: {
      caisse: {
        type: Object,
        required: true
      }
    },
  
    setup(props, { emit }) {
      const store = useStore();
  
      // État
      const billetage = ref([
        { coupure: 10000, quantite: 0 },
        { coupure: 5000, quantite: 0 },
        { coupure: 2000, quantite: 0 },
        { coupure: 1000, quantite: 0 },
        { coupure: 500, quantite: 0 },
        { coupure: 200, quantite: 0 },
        { coupure: 100, quantite: 0 },
        { coupure: 50, quantite: 0 },
        { coupure: 25, quantite: 0 },
        { coupure: 10, quantite: 0 },
        { coupure: 5, quantite: 0 }
      ]);
  
      const operations = ref([]);
      const filterType = ref('');
      const filterMode = ref('');
      const commentaire = ref('');
      const showConfirmation = ref(false);
      const fondsInitial = ref(0);
      const totalEncaissements = ref(0);
      const totalDecaissements = ref(0);
  
      // Computed
      const totalComptage = computed(() => {
        return billetage.value.reduce((sum, billet) => {
          return sum + (billet.coupure * billet.quantite);
        }, 0);
      });
  
      const soldeTheorique = computed(() => {
        return fondsInitial.value + totalEncaissements.value - totalDecaissements.value;
      });
  
      const ecart = computed(() => {
        return totalComptage.value - soldeTheorique.value;
      });
  
      const getEcartClass = computed(() => {
        if (ecart.value > 0) return 'text-success';
        if (ecart.value < 0) return 'text-danger';
        return '';
      });
  
      const filteredOperations = computed(() => {
        return operations.value.filter(op => {
          const matchType = !filterType.value || op.type === filterType.value;
          const matchMode = !filterMode.value || op.mode_paiement === filterMode.value;
          return matchType && matchMode;
        });
      });
  
      const canCloturer = computed(() => {
        return totalComptage.value > 0;
      });
  
      // Méthodes
      const loadData = async () => {
        try {
          const [operationsRes, fondsRes] = await Promise.all([
            api.get(`/caisses/${props.caisse.id}/operations`),
            api.get(`/caisses/${props.caisse.id}/fonds`)
          ]);
  
          operations.value = operationsRes.data;
          fondsInitial.value = fondsRes.data.montant;
  
          // Calculer les totaux
          totalEncaissements.value = operations.value
            .filter(op => op.type === 'encaissement')
            .reduce((sum, op) => sum + op.montant, 0);
  
          totalDecaissements.value = operations.value
            .filter(op => op.type === 'decaissement')
            .reduce((sum, op) => sum + op.montant, 0);
  
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des données'
          });
        }
      };
  
      const updateTotals = () => {
        // Les totaux sont mis à jour automatiquement grâce aux computed properties
      };
  
      const imprimerBilan = async () => {
        try {
          const response = await api.get(
            `/caisses/${props.caisse.id}/bilan/print`,
            { responseType: 'blob' }
          );
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `bilan_caisse_${new Date().toISOString().split('T')[0]}.pdf`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'impression du bilan'
          });
        }
      };
  
      const cloturerCaisse = () => {
        showConfirmation.value = true;
      };
  
      const confirmerCloture = async () => {
        try {
          await api.post(`/caisses/${props.caisse.id}/cloture`, {
            billetage: billetage.value,
            solde_reel: totalComptage.value,
            solde_theorique: soldeTheorique.value,
            ecart: ecart.value,
            commentaire: commentaire.value
          });
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Caisse clôturée avec succès'
          });
  
          emit('success');
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la clôture de la caisse'
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
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
  
      const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('fr-FR');
      };
  
      const getCaisseStatusClass = (etat) => {
        const classes = {
          'ouverte': 'status-open',
          'fermée': 'status-closed'
        };
        return classes[etat] || '';
      };
  
      const getOperationTypeClass = (type) => {
        return `type-${type}`;
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadData();
      });
  
      return {
        billetage,
        operations,
        filterType,
        filterMode,
        commentaire,
        showConfirmation,
        fondsInitial,
        totalEncaissements,
        totalDecaissements,
        totalComptage,
        soldeTheorique,
        ecart,
        getEcartClass,
        filteredOperations,
        canCloturer,
        updateTotals,
        imprimerBilan,
        cloturerCaisse,
        confirmerCloture,
        formatPrice,
        formatDate,
        formatTime,
        getCaisseStatusClass,
        getOperationTypeClass
      };
    }
  };
  </script>
  
  <style scoped>
  .cloture-caisse {
    padding: 2rem;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .caisse-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
  }
  
  .status-open {
    background: #d1e7dd;
    color: #0f5132;
  }
  
  .status-closed {
    background: #f8d7da;
    color: #842029;
  }
  
  .summary-section {
    margin-bottom: 2rem;
  }
  
  .summary-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .card-header {
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .summary-row.total {
    font-size: 1.25rem;
    font-weight: 500;
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  
  .counting-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .table th,
  .table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  .form-control {
    width: 100px;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    text-align: right;
  }
  
  .operations-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
  }
  
  .form-select {
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .operation-type {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }
  
  .type-encaissement {
    background: #d1e7dd;
    color: #0f5132;
  }
  
  .type-decaissement {
    background: #f8d7da;
    color: #842029;
  }
  
  .actions-section {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 2rem;
  }
  
  .commentaire-section {
    flex: 1;
  }
  
  .commentaire-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .buttons-section {
    display: flex;
    gap: 1rem;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .btn-primary {
    background: #ff6600;
    color: white;
  }
  
  .btn-primary:disabled {
    background: #ffd1b3;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
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
  
  .confirmation-details {
    margin-bottom: 1.5rem;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .confirmation-message {
    color: #842029;
    background: #f8d7da;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
  }
  
  /* Utility classes */
  .text-success {
    color: #0f5132;
  }
  
  .text-danger {
    color: #842029;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .cloture-caisse {
      padding: 1rem;
    }
  
    .header-section {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  
    .filters {
      flex-direction: column;
    }
  
    .actions-section {
      flex-direction: column;
    }
  
    .buttons-section {
      flex-direction: column;
      width: 100%;
    }
  
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>
  