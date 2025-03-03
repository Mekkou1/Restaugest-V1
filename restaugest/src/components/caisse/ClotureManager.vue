<template>
    <div class="cloture-manager">
      <div class="header-section">
        <h2>Clôture de caisse</h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary"
            @click="exporterCloture"
            :disabled="!derniereCloture"
          >
            <i class="fas fa-file-export"></i>
            Exporter dernière clôture
          </button>
          <button 
            class="btn btn-primary"
            @click="demarrerCloture"
            :disabled="!peutCloturer"
          >
            <i class="fas fa-lock"></i>
            Clôturer la caisse
          </button>
        </div>
      </div>
  
      <!-- État de la caisse -->
      <div class="etat-section">
        <div class="etat-grid">
          <!-- Résumé de la journée -->
          <div class="etat-card">
            <div class="card-header">
              <h3>Résumé de la journée</h3>
              <span class="date">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="card-content">
              <div class="resume-grid">
                <div class="resume-item">
                  <span class="label">Ouverture</span>
                  <span class="value">{{ formatDateTime(ouverture?.date) }}</span>
                </div>
                <div class="resume-item">
                  <span class="label">Fonds initial</span>
                  <span class="value">{{ formatPrice(ouverture?.montant) }}</span>
                </div>
                <div class="resume-item">
                  <span class="label">Nombre de tickets</span>
                  <span class="value">{{ stats.nombre_tickets }}</span>
                </div>
                <div class="resume-item">
                  <span class="label">Chiffre d'affaires</span>
                  <span class="value">{{ formatPrice(stats.chiffre_affaires) }}</span>
                </div>
                <div class="resume-item">
                  <span class="label">Total remises</span>
                  <span class="value text-danger">-{{ formatPrice(stats.total_remises) }}</span>
                </div>
                <div class="resume-item">
                  <span class="label">Total avoirs</span>
                  <span class="value text-warning">{{ formatPrice(stats.total_avoirs) }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Répartition par mode -->
          <div class="etat-card">
            <div class="card-header">
              <h3>Répartition par mode</h3>
            </div>
            <div class="card-content">
              <div class="modes-list">
                <div 
                  v-for="mode in repartitionModes"
                  :key="mode.type"
                  class="mode-item"
                >
                  <div class="mode-info">
                    <i :class="getPaymentIcon(mode.type)"></i>
                    <span>{{ mode.label }}</span>
                  </div>
                  <div class="mode-amount">
                    {{ formatPrice(mode.montant) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Dernière clôture -->
          <div class="etat-card">
            <div class="card-header">
              <h3>Dernière clôture</h3>
            </div>
            <div class="card-content">
              <div 
                v-if="derniereCloture"
                class="cloture-info"
              >
                <div class="info-row">
                  <span class="label">Date</span>
                  <span>{{ formatDateTime(derniereCloture.date) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Caissier</span>
                  <span>{{ derniereCloture.utilisateur.nom }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Montant théorique</span>
                  <span>{{ formatPrice(derniereCloture.montant_theorique) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Montant réel</span>
                  <span>{{ formatPrice(derniereCloture.montant_reel) }}</span>
                </div>
                <div 
                  class="info-row"
                  :class="getEcartClass(derniereCloture.ecart)"
                >
                  <span class="label">Écart</span>
                  <span>{{ formatPrice(derniereCloture.ecart) }}</span>
                </div>
              </div>
              <div 
                v-else
                class="empty-state"
              >
                <i class="fas fa-clock"></i>
                <p>Aucune clôture précédente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de clôture -->
      <div class="modal" :class="{ 'show': showClotureModal }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Clôture de caisse</h5>
              <button 
                type="button" 
                class="btn-close"
                @click="closeClotureModal"
              ></button>
            </div>
            <div class="modal-body">
              <!-- Étape 1: Comptage -->
              <div v-if="etapeCloture === 1">
                <h6>Étape 1: Comptage des espèces</h6>
                <div class="comptage-section">
                  <div class="billets-section">
                    <h6>Billets</h6>
                    <div class="billets-grid">
                      <div 
                        v-for="billet in billets"
                        :key="billet.valeur"
                        class="billet-item"
                      >
                        <div class="billet-info">
                          <span>{{ formatPrice(billet.valeur) }}</span>
                        </div>
                        <div class="billet-count">
                          <button 
                            class="btn-count"
                            @click="decrementerBillet(billet)"
                            :disabled="billet.quantite <= 0"
                          >
                            <i class="fas fa-minus"></i>
                          </button>
                          <input 
                            type="number" 
                            v-model.number="billet.quantite"
                            class="form-control"
                            min="0"
                            @input="calculerTotal"
                          >
                          <button 
                            class="btn-count"
                            @click="incrementerBillet(billet)"
                          >
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                        <div class="billet-total">
                          {{ formatPrice(billet.valeur * billet.quantite) }}
                        </div>
                      </div>
                    </div>
                  </div>
  
                  <div class="pieces-section">
                    <h6>Pièces</h6>
                    <div class="pieces-grid">
                      <div 
                        v-for="piece in pieces"
                        :key="piece.valeur"
                        class="piece-item"
                      >
                        <div class="piece-info">
                          <span>{{ formatPrice(piece.valeur) }}</span>
                        </div>
                        <div class="piece-count">
                          <button 
                            class="btn-count"
                            @click="decrementerPiece(piece)"
                            :disabled="piece.quantite <= 0"
                          >
                            <i class="fas fa-minus"></i>
                          </button>
                          <input 
                            type="number" 
                            v-model.number="piece.quantite"
                            class="form-control"
                            min="0"
                            @input="calculerTotal"
                          >
                          <button 
                            class="btn-count"
                            @click="incrementerPiece(piece)"
                          >
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                        <div class="piece-total">
                          {{ formatPrice(piece.valeur * piece.quantite) }}
                        </div>
                      </div>
                    </div>
                  </div>
  
                  <div class="comptage-total">
                    <span>Total espèces:</span>
                    <span class="total-amount">{{ formatPrice(totalComptage) }}</span>
                  </div>
                </div>
              </div>
  
              <!-- Étape 2: Vérification -->
              <div v-else-if="etapeCloture === 2">
                <h6>Étape 2: Vérification</h6>
                <div class="verification-section">
                  <div class="verification-row">
                    <span>Montant théorique:</span>
                    <span>{{ formatPrice(montantTheorique) }}</span>
                  </div>
                  <div class="verification-row">
                    <span>Montant compté:</span>
                    <span>{{ formatPrice(totalComptage) }}</span>
                  </div>
                  <div 
                    class="verification-row"
                    :class="getEcartClass(ecartComptage)"
                  >
                    <span>Écart:</span>
                    <span>{{ formatPrice(ecartComptage) }}</span>
                  </div>
  
                  <div 
                    v-if="ecartComptage !== 0"
                    class="alert"
                    :class="getAlertClass(ecartComptage)"
                  >
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{{ getAlertMessage(ecartComptage) }}</span>
                  </div>
  
                  <div class="form-group">
                    <label>Commentaire</label>
                    <textarea 
                      v-model="commentaireCloture"
                      class="form-control"
                      rows="3"
                      placeholder="Explications sur l'écart éventuel..."
                    ></textarea>
                  </div>
                </div>
              </div>
  
              <!-- Étape 3: Confirmation -->
              <div v-else>
                <h6>Étape 3: Confirmation</h6>
                <div class="confirmation-section">
                  <p>Vous êtes sur le point de clôturer la caisse.</p>
                  <p>Cette action est irréversible.</p>
  
                  <div class="confirmation-details">
                    <div class="detail-row">
                      <span>Date d'ouverture:</span>
                      <span>{{ formatDateTime(ouverture?.date) }}</span>
                    </div>
                    <div class="detail-row">
                      <span>Durée de service:</span>
                      <span>{{ formatDuree(ouverture?.date) }}</span>
                    </div>
                    <div class="detail-row">
                      <span>Nombre de transactions:</span>
                      <span>{{ stats.nombre_tickets }}</span>
                    </div>
                    <div class="detail-row">
                      <span>Chiffre d'affaires:</span>
                      <span>{{ formatPrice(stats.chiffre_affaires) }}</span>
                    </div>
                    <div class="detail-row">
                      <span>Montant théorique:</span>
                      <span>{{ formatPrice(montantTheorique) }}</span>
                    </div>
                    <div class="detail-row">
                      <span>Montant compté:</span>
                      <span>{{ formatPrice(totalComptage) }}</span>
                    </div>
                    <div 
                      class="detail-row"
                      :class="getEcartClass(ecartComptage)"
                    >
                      <span>Écart:</span>
                      <span>{{ formatPrice(ecartComptage) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="etapePrecedente"
                :disabled="etapeCloture === 1"
              >
                Retour
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="etapeSuivante"
              >
                {{ etapeCloture === 3 ? 'Confirmer la clôture' : 'Suivant' }}
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
    name: 'ClotureManager',
  
    setup() {
      const store = useStore();
      const router = useRouter();
  
      // État
      const ouverture = ref(null);
      const stats = ref({
        nombre_tickets: 0,
        chiffre_affaires: 0,
        total_remises: 0,
        total_avoirs: 0
      });
      const derniereCloture = ref(null);
      const repartitionModes = ref([]);
  
      const showClotureModal = ref(false);
      const etapeCloture = ref(1);
      const commentaireCloture = ref('');
  
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
  
      // Computed
      const peutCloturer = computed(() => {
        return ouverture.value && !derniereCloture.value;
      });
  
      const totalComptage = computed(() => {
        const totalBillets = billets.value.reduce((sum, b) => {
          return sum + (b.valeur * b.quantite);
        }, 0);
        const totalPieces = pieces.value.reduce((sum, p) => {
          return sum + (p.valeur * p.quantite);
        }, 0);
        return totalBillets + totalPieces;
      });
  
      const montantTheorique = computed(() => {
        return (ouverture.value?.montant || 0) + 
          stats.value.chiffre_affaires - 
          stats.value.total_remises;
      });
  
      const ecartComptage = computed(() => {
        return totalComptage.value - montantTheorique.value;
      });
  
      // Méthodes
      const loadData = async () => {
        try {
          const [ouvertureRes, statsRes, clotureRes, modesRes] = await Promise.all([
            api.get('/caisse/ouverture'),
            api.get('/caisse/stats/jour'),
            api.get('/caisse/derniere-cloture'),
            api.get('/caisse/repartition-modes')
          ]);
  
          ouverture.value = ouvertureRes.data;
          stats.value = statsRes.data;
          derniereCloture.value = clotureRes.data;
          repartitionModes.value = modesRes.data;
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors du chargement des données'
          });
        }
      };
  
      const demarrerCloture = () => {
        etapeCloture.value = 1;
        commentaireCloture.value = '';
        resetComptage();
        showClotureModal.value = true;
      };
  
      const closeClotureModal = () => {
        if (!confirm('Voulez-vous vraiment annuler la clôture ?')) return;
        
        showClotureModal.value = false;
        etapeCloture.value = 1;
        commentaireCloture.value = '';
        resetComptage();
      };
  
      const resetComptage = () => {
        billets.value.forEach(b => b.quantite = 0);
        pieces.value.forEach(p => p.quantite = 0);
      };
  
      const calculerTotal = () => {
        // Le total est calculé automatiquement via computed
      };
  
      const incrementerBillet = (billet) => {
        billet.quantite++;
        calculerTotal();
      };
  
      const decrementerBillet = (billet) => {
        if (billet.quantite > 0) {
          billet.quantite--;
          calculerTotal();
        }
      };
  
      const incrementerPiece = (piece) => {
        piece.quantite++;
        calculerTotal();
      };
  
      const decrementerPiece = (piece) => {
        if (piece.quantite > 0) {
          piece.quantite--;
          calculerTotal();
        }
      };
  
      const etapePrecedente = () => {
        if (etapeCloture.value > 1) {
          etapeCloture.value--;
        }
      };
  
      const etapeSuivante = async () => {
        if (etapeCloture.value < 3) {
          etapeCloture.value++;
        } else {
          await confirmerCloture();
        }
      };
  
      const confirmerCloture = async () => {
        try {
          await api.post('/caisse/cloture', {
            montant_reel: totalComptage.value,
            montant_theorique: montantTheorique.value,
            ecart: ecartComptage.value,
            commentaire: commentaireCloture.value,
            billets: billets.value,
            pieces: pieces.value
          });
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Caisse clôturée avec succès'
          });
  
          router.push('/caisse');
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la clôture'
          });
        }
      };
  
      const exporterCloture = async () => {
        try {
          const response = await api.get('/caisse/cloture/export', {
            responseType: 'blob'
          });
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `cloture_${new Date().toISOString().split('T')[0]}.pdf`
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
  
      const getPaymentIcon = (type) => {
        const icons = {
          'ESPECES': 'fas fa-money-bill-wave',
          'CARTE': 'fas fa-credit-card',
          'MOBILE': 'fas fa-mobile-alt',
          'CHEQUE': 'fas fa-money-check-alt',
          'VIREMENT': 'fas fa-university'
        };
        return icons[type] || 'fas fa-wallet';
      };
  
      const getEcartClass = (ecart) => {
        if (ecart > 0) return 'text-success';
        if (ecart < 0) return 'text-danger';
        return '';
      };
  
      const getAlertClass = (ecart) => {
        if (ecart > 0) return 'alert-warning';
        if (ecart < 0) return 'alert-danger';
        return 'alert-success';
      };
  
      const getAlertMessage = (ecart) => {
        if (ecart > 0) {
          return `Excédent de caisse de ${formatPrice(Math.abs(ecart))}`;
        }
        if (ecart < 0) {
          return `Manque en caisse de ${formatPrice(Math.abs(ecart))}`;
        }
        return 'Comptage exact';
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
  
      const formatDateTime = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('fr-FR');
      };
  
      const formatDuree = (date) => {
        if (!date) return '-';
        const debut = new Date(date);
        const fin = new Date();
        const diff = fin - debut;
        const heures = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${heures}h ${minutes}min`;
      };
  
      // Lifecycle hooks
      onMounted(() => {
        loadData();
      });
  
      return {
        ouverture,
        stats,
        derniereCloture,
        repartitionModes,
        showClotureModal,
        etapeCloture,
        commentaireCloture,
        billets,
        pieces,
        peutCloturer,
        totalComptage,
        montantTheorique,
        ecartComptage,
        demarrerCloture,
        closeClotureModal,
        calculerTotal,
        incrementerBillet,
        decrementerBillet,
        incrementerPiece,
        decrementerPiece,
        etapePrecedente,
        etapeSuivante,
        exporterCloture,
        getPaymentIcon,
        getEcartClass,
        getAlertClass,
        getAlertMessage,
        formatPrice,
        formatDate,
        formatDateTime,
        formatDuree
      };
    }
  };
  </script>
  
  <style scoped>
  .cloture-manager {
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
  
  .etat-section {
    margin-bottom: 2rem;
  }
  
  .etat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .etat-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .card-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .date {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .resume-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .resume-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .resume-item .label {
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .resume-item .value {
    font-weight: 500;
  }
  
  .modes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .mode-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .mode-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .mode-amount {
    font-weight: 500;
  }
  
  .cloture-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
  }
  
  .info-row .label {
    color: #6c757d;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }
  
  .empty-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .comptage-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .billets-section,
  .pieces-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .billets-grid,
  .pieces-grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .billet-item,
  .piece-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .billet-info,
  .piece-info {
    width: 100px;
  }
  
  .billet-count,
  .piece-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-count {
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
  
  .btn-count:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .form-control {
    width: 80px;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    text-align: center;
  }
  
  .billet-total,
  .piece-total {
    width: 120px;
    text-align: right;
    font-weight: 500;
  }
  
  .comptage-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    font-weight: 500;
  }
  
  .total-amount {
    font-size: 1.25rem;
    color: #ff6600;
  }
  
  .verification-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .verification-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
  }
  
  .alert {
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .alert-success {
    background: #d1e7dd;
    color: #0f5132;
  }
  
  .alert-warning {
    background: #fff3cd;
    color: #664d03;
  }
  
  .alert-danger {
    background: #f8d7da;
    color: #842029;
  }
  
  .confirmation-section {
    text-align: center;
  }
  
  .confirmation-details {
    margin-top: 1.5rem;
    text-align: left;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #dee2e6;
  }
  
  .detail-row:last-child {
    border-bottom: none;
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
  
  .text-success {
    color: #28a745;
  }
  
  .text-danger {
    color: #dc3545;
  }
  
  .text-warning {
    color: #ffc107;
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
  
  ./* Continuation du style précédent */

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
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

/* Responsive styles */
@media (max-width: 768px) {
  .cloture-manager {
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

  .etat-grid {
    grid-template-columns: 1fr;
  }

  .resume-grid {
    grid-template-columns: 1fr;
  }

  .mode-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .comptage-section {
    gap: 1rem;
  }

  .billet-item,
  .piece-item {
    flex-wrap: wrap;
  }

  .billet-info,
  .piece-info {
    width: 100%;
  }

  .billet-count,
  .piece-count {
    width: 100%;
    justify-content: space-between;
  }

  .billet-total,
  .piece-total {
    width: 100%;
    text-align: left;
    margin-top: 0.5rem;
  }

  .verification-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-dialog {
    margin: 0.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-footer .btn {
    width: 100%;
  }

  .confirmation-details {
    margin-top: 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 0;
  }
}

/* Print styles */
@media print {
  .cloture-manager {
    padding: 0;
  }

  .header-actions,
  .btn,
  .modal {
    display: none !important;
  }

  .etat-grid {
    grid-template-columns: 1fr;
  }

  .etat-card {
    break-inside: avoid;
    margin-bottom: 1rem;
    box-shadow: none;
    border: 1px solid #dee2e6;
  }

  .card-content {
    padding: 1rem;
  }

  .resume-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modes-list {
    break-inside: avoid;
  }

  .mode-item {
    padding: 0.5rem 0;
  }

  .cloture-info {
    break-inside: avoid;
  }

  .info-row {
    padding: 0.25rem 0;
  }
}
</style>

  