<template>
    <div class="modal d-flex justify-content-center align-items-center">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Transfert de fonds</h2>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="effectuerTransfert">
              <!-- Sélection de la caisse destinataire -->
              <div class="form-group mb-3">
                <label>Caisse destinataire</label>
                <select v-model="caisseDestinataire" class="form-select" required>
                  <option value="">Sélectionner une caisse</option>
                  <option 
                    v-for="caisse in caissesDisponibles" 
                    :key="caisse.id"
                    :value="caisse.id"
                  >
                    {{ caisse.nom }}
                  </option>
                </select>
              </div>
  
              <!-- Billetage -->
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Coupure</th>
                    <th>Quantité</th>
                    <th>Devise</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(billet, index) in billetage" :key="index">
                    <td>{{ billet.coupure }}</td>
                    <td>
                      <input 
                        type="number" 
                        v-model="billet.quantite" 
                        class="form-control" 
                        min="0"
                        required
                      >
                    </td>
                    <td>{{ billet.devise }}</td>
                    <td>{{ formatPrice(billet.coupure * billet.quantite) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">Total</td>
                    <td>{{ formatPrice(total) }}</td>
                  </tr>
                </tfoot>
              </table>
  
              <!-- Motif du transfert -->
              <div class="form-group mb-3">
                <label>Motif du transfert</label>
                <textarea 
                  v-model="motif" 
                  class="form-control" 
                  rows="2"
                  placeholder="Raison du transfert..."
                  required
                ></textarea>
              </div>
  
              <!-- Actions -->
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="$emit('close')"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="!isValid"
                >
                  Effectuer le transfert
                </button>
              </div>
            </form>
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
    name: 'TransfertModal',
  
    props: {
      caisseSource: {
        type: Object,
        required: true
      }
    },
  
    setup(props, { emit }) {
      const store = useStore();
  
      // État
      const caisseDestinataire = ref('');
      const motif = ref('');
      const caissesDisponibles = ref([]);
      const billetage = ref([
        { coupure: 10000, quantite: 0, devise: 'XOF' },
        { coupure: 5000, quantite: 0, devise: 'XOF' },
        { coupure: 2000, quantite: 0, devise: 'XOF' },
        { coupure: 1000, quantite: 0, devise: 'XOF' },
        { coupure: 500, quantite: 0, devise: 'XOF' },
        { coupure: 200, quantite: 0, devise: 'XOF' },
        { coupure: 100, quantite: 0, devise: 'XOF' },
        { coupure: 50, quantite: 0, devise: 'XOF' },
        { coupure: 25, quantite: 0, devise: 'XOF' },
        { coupure: 10, quantite: 0, devise: 'XOF' },
        { coupure: 5, quantite: 0, devise: 'XOF' }
      ]);
  
      // Computed
      const total = computed(() => {
        return billetage.value.reduce((sum, billet) => {
          return sum + (billet.coupure * billet.quantite);
        }, 0);
      });
  
      const isValid = computed(() => {
        return total.value > 0 && 
          caisseDestinataire.value && 
          motif.value.trim() &&
          total.value <= props.caisseSource.solde;
      });
  
      // Méthodes
      const loadCaisses = async () => {
        try {
          const response = await api.get('/caisses');
          caissesDisponibles.value = response.data.filter(caisse => 
            caisse.id !== props.caisseSource.id
          );
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des caisses'
          });
        }
      };
  
      const effectuerTransfert = async () => {
        try {
          await api.post('/transferts', {
            caisse_source: props.caisseSource.id,
            caisse_destination: caisseDestinataire.value,
            montant: total.value,
            billetage: billetage.value,
            motif: motif.value
          });
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Transfert effectué avec succès'
          });
  
          emit('success');
          emit('close');
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du transfert'
          });
        }
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadCaisses();
      });
  
      return {
        caisseDestinataire,
        motif,
        caissesDisponibles,
        billetage,
        total,
        isValid,
        effectuerTransfert,
        formatPrice
      };
    }
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  .modal-dialog {
    max-width: 600px;
    width: 90%;
    margin: 2rem auto;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-control,
  .form-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .table {
    margin-bottom: 1rem;
  }
  
  .table th {
    background: #f8f9fa;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .btn-primary {
    background: #ff6600;
    border: none;
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
  
  .gap-2 {
    gap: 0.5rem;
  }
  </style>
  