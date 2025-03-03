<template>
    <div class="billetage-manager">
      <div class="header-section">
        <h2>Gestion du billetage</h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary"
            @click="reinitialiserComptage"
          >
            <i class="fas fa-undo"></i>
            Réinitialiser
          </button>
          <button 
            class="btn btn-primary"
            @click="validerComptage"
            :disabled="!hasChanges"
          >
            <i class="fas fa-check"></i>
            Valider le comptage
          </button>
        </div>
      </div>
  
      <!-- Comptage des billets et pièces -->
      <div class="counting-section">
        <div class="counting-grid">
          <!-- Billets -->
          <div class="counting-card">
            <h3>Billets</h3>
            <div class="counting-rows">
              <div 
                v-for="billet in billets"
                :key="billet.valeur"
                class="counting-row"
              >
                <div class="denomination">
                  <span class="amount">{{ formatPrice(billet.valeur) }}</span>
                  <img 
                    :src="getBilletImage(billet.valeur)"
                    :alt="`Billet de ${billet.valeur}`"
                    class="currency-image"
                  >
                </div>
                <div class="quantity-input">
                  <button 
                    class="btn-quantity"
                    @click="decrement(billet)"
                    :disabled="billet.quantite <= 0"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <input 
                    type="number" 
                    v-model.number="billet.quantite"
                    class="form-control"
                    min="0"
                    @input="updateTotals"
                  >
                  <button 
                    class="btn-quantity"
                    @click="increment(billet)"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="subtotal">
                  {{ formatPrice(billet.valeur * billet.quantite) }}
                </div>
              </div>
            </div>
            <div class="counting-total">
              <span>Total billets:</span>
              <span>{{ formatPrice(totalBillets) }}</span>
            </div>
          </div>
  
          <!-- Pièces -->
          <div class="counting-card">
            <h3>Pièces</h3>
            <div class="counting-rows">
              <div 
                v-for="piece in pieces"
                :key="piece.valeur"
                class="counting-row"
              >
                <div class="denomination">
                  <span class="amount">{{ formatPrice(piece.valeur) }}</span>
                  <img 
                    :src="getPieceImage(piece.valeur)"
                    :alt="`Pièce de ${piece.valeur}`"
                    class="currency-image"
                  >
                </div>
                <div class="quantity-input">
                  <button 
                    class="btn-quantity"
                    @click="decrement(piece)"
                    :disabled="piece.quantite <= 0"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <input 
                    type="number" 
                    v-model.number="piece.quantite"
                    class="form-control"
                    min="0"
                    @input="updateTotals"
                  >
                  <button 
                    class="btn-quantity"
                    @click="increment(piece)"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="subtotal">
                  {{ formatPrice(piece.valeur * piece.quantite) }}
                </div>
              </div>
            </div>
            <div class="counting-total">
              <span>Total pièces:</span>
              <span>{{ formatPrice(totalPieces) }}</span>
            </div>
          </div>
        </div>
  
        <!-- Total général -->
        <div class="total-section">
          <div class="total-card">
            <div class="total-row">
              <span>Total espèces:</span>
              <span class="total-amount">{{ formatPrice(totalGeneral) }}</span>
            </div>
            <div 
              v-if="ecart !== 0"
              class="ecart-row"
              :class="getEcartClass"
            >
              <span>Écart:</span>
              <span>{{ formatPrice(ecart) }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Détail du comptage -->
      <div class="detail-section">
        <div class="detail-header">
          <h3>Détail du comptage</h3>
          <button 
            class="btn btn-secondary"
            @click="exporterDetail"
          >
            <i class="fas fa-file-export"></i>
            Exporter
          </button>
        </div>
  
        <div class="detail-content">
          <div class="detail-row">
            <span class="label">Date du comptage:</span>
            <span>{{ formatDateTime(new Date()) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Caissier:</span>
            <span>{{ caissier }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Montant attendu:</span>
            <span>{{ formatPrice(montantAttendu) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Montant compté:</span>
            <span>{{ formatPrice(totalGeneral) }}</span>
          </div>
          <div 
            class="detail-row"
            :class="getEcartClass"
          >
            <span class="label">Écart:</span>
            <span>{{ formatPrice(ecart) }}</span>
          </div>
        </div>
  
        <div class="detail-notes">
          <label>Notes et observations</label>
          <textarea 
            v-model="notes"
            class="form-control"
            rows="3"
            placeholder="Ajouter des notes sur le comptage..."
          ></textarea>
        </div>
      </div>
  
      <!-- Modal de confirmation -->
      <div class="modal" :class="{ 'show': showConfirmation }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmer le comptage</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="showConfirmation = false"
              ></button>
            </div>
            <div class="modal-body">
              <div class="confirmation-details">
                <div class="detail-row">
                  <span>Montant attendu:</span>
                  <span>{{ formatPrice(montantAttendu) }}</span>
                </div>
                <div class="detail-row">
                  <span>Montant compté:</span>
                  <span>{{ formatPrice(totalGeneral) }}</span>
                </div>
                <div 
                  class="detail-row"
                  :class="getEcartClass"
                >
                  <span>Écart:</span>
                  <span>{{ formatPrice(ecart) }}</span>
                </div>
              </div>
  
              <div 
                v-if="ecart !== 0"
                class="alert"
                :class="ecart > 0 ? 'alert-warning' : 'alert-danger'"
              >
                <i class="fas fa-exclamation-triangle"></i>
                <span v-if="ecart > 0">
                  Excédent de caisse détecté. Veuillez vérifier le comptage.
                </span>
                <span v-else>
                  Manque en caisse détecté. Veuillez vérifier le comptage.
                </span>
              </div>
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
                @click="confirmerComptage"
              >
                Confirmer
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
    name: 'BilletageManager',
  
    props: {
      montantAttendu: {
        type: Number,
        required: true
      }
    },
  
    setup(props, { emit }) {
      const store = useStore();
  
      // État
      const billets = ref([
        { valeur: 10000, quantite: 0 },
        { valeur: 5000, quantite: 0 },
        { valeur: 2000, quantite: 0 },
        { valeur: 1000, quantite: 0 },
        { valeur: 500, quantite: 0 }
      ]);
  
      const pieces = ref([
        { valeur: 500, quantite: 0 },
        { valeur: 200, quantite: 0 },
        { valeur: 100, quantite: 0 },
        { valeur: 50, quantite: 0 },
        { valeur: 25, quantite: 0 },
        { valeur: 10, quantite: 0 },
        { valeur: 5, quantite: 0 }
      ]);
  
      const notes = ref('');
      const showConfirmation = ref(false);
      const caissier = ref('');
      const originalState = ref(null);
  
      // Computed
      const totalBillets = computed(() => {
        return billets.value.reduce((sum, billet) => {
          return sum + (billet.valeur * billet.quantite);
        }, 0);
      });
  
      const totalPieces = computed(() => {
        return pieces.value.reduce((sum, piece) => {
          return sum + (piece.valeur * piece.quantite);
        }, 0);
      });
  
      const totalGeneral = computed(() => {
        return totalBillets.value + totalPieces.value;
      });
  
      const ecart = computed(() => {
        return totalGeneral.value - props.montantAttendu;
      });
  
      const getEcartClass = computed(() => {
        if (ecart.value > 0) return 'text-success';
        if (ecart.value < 0) return 'text-danger';
        return '';
      });
  
      const hasChanges = computed(() => {
        const currentState = JSON.stringify({
          billets: billets.value,
          pieces: pieces.value,
          notes: notes.value
        });
        return currentState !== originalState.value;
      });
  
      // Méthodes
      const loadCaissier = async () => {
        try {
          const response = await api.get('/utilisateur/current');
          caissier.value = response.data.nom;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des informations'
          });
        }
      };
  
      const increment = (item) => {
        item.quantite++;
        updateTotals();
      };
  
      const decrement = (item) => {
        if (item.quantite > 0) {
          item.quantite--;
          updateTotals();
        }
      };
  
      const updateTotals = () => {
        // Les totaux sont mis à jour automatiquement grâce aux computed properties
      };
  
      const reinitialiserComptage = () => {
        billets.value.forEach(billet => billet.quantite = 0);
        pieces.value.forEach(piece => piece.quantite = 0);
        notes.value = '';
        updateTotals();
      };
  
      const validerComptage = () => {
        showConfirmation.value = true;
      };
  
      const confirmerComptage = async () => {
        try {
          await api.post('/comptages', {
            billets: billets.value,
            pieces: pieces.value,
            total: totalGeneral.value,
            ecart: ecart.value,
            notes: notes.value
          });
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Comptage enregistré avec succès'
          });
  
          emit('success', {
            total: totalGeneral.value,
            ecart: ecart.value
          });
  
          showConfirmation.value = false;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'enregistrement du comptage'
          });
        }
      };
  
      const exporterDetail = async () => {
        try {
          const response = await api.get('/comptages/export', {
            params: {
              billets: billets.value,
              pieces: pieces.value,
              total: totalGeneral.value,
              ecart: ecart.value,
              notes: notes.value
            },
            responseType: 'blob'
          });
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `comptage_${new Date().toISOString().split('T')[0]}.pdf`
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
  
      const getBilletImage = (valeur) => {
        return `/images/billets/${valeur}.png`;
      };
  
      const getPieceImage = (valeur) => {
        return `/images/pieces/${valeur}.png`;
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      const formatDateTime = (date) => {
        return date.toLocaleString('fr-FR');
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadCaissier();
        originalState.value = JSON.stringify({
          billets: billets.value,
          pieces: pieces.value,
          notes: notes.value
        });
      });
  
      return {
        billets,
        pieces,
        notes,
        showConfirmation,
        caissier,
        totalBillets,
        totalPieces,
        totalGeneral,
        ecart,
        getEcartClass,
        hasChanges,
        increment,
        decrement,
        updateTotals,
        reinitialiserComptage,
        validerComptage,
        confirmerComptage,
        exporterDetail,
        getBilletImage,
        getPieceImage,
        formatPrice,
        formatDateTime
      };
    }
  };
  </script>
  
  <style scoped>
  .billetage-manager {
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
  
  .counting-section {
    margin-bottom: 2rem;
  }
  
  .counting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .counting-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .counting-rows {
    margin-bottom: 1rem;
  }
  
  .counting-row {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #dee2e6;
  }
  
  .counting-row:last-child {
    border-bottom: none;
  }
  
  .denomination {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .amount {
    font-weight: 500;
    min-width: 80px;
  }
  
  .currency-image {
    width: 60px;
    height: 30px;
    object-fit: contain;
  }
  
  .quantity-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 1rem;
  }
  
  .form-control {
    width: 80px;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    text-align: center;
  }
  
  .btn-quantity {
    width: 32px;
    height: 32px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: white;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-quantity:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .subtotal {
    min-width: 100px;
    text-align: right;
    font-weight: 500;
  }
  
  .counting-total {
    display: flex;
    justify-content: space-between;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
    font-weight: 500;
  }
  
  .total-section {
    margin-top: 2rem;
  }
  
  .total-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 1.5rem;
    font-weight: 500;
  }
  
  .ecart-row {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
  
  .detail-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .detail-content {
    margin-bottom: 1.5rem;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .detail-notes label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .detail-notes textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    resize: vertical;
  }
  
  .text-success {
    color: #28a745;
  }
  
  .text-danger {
    color: #dc3545;
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
  
  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
  
  .alert {
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .alert-warning {
    background: #fff3cd;
    color: #664d03;
  }
  
  .alert-danger {
    background: #f8d7da;
    color: #842029;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .billetage-manager {
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
  
    .counting-grid {
      grid-template-columns: 1fr;
    }
  
    .counting-row {
      flex-wrap: wrap;
    }
  
    .denomination {
      width: 100%;
      margin-bottom: 1rem;
    }
  
    .quantity-input {
      width: 100%;
      justify-content: space-between;
      margin: 0 0 1rem;
    }
  
    .subtotal {
      width: 100%;
      text-align: left;
    }
  }
  </style>
  