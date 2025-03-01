<template>
  <DashboardLayout :title="'Module Caisse'" :menuItems="menuItems">
    <div class="container-fluid">
      <!-- En-tête avec informations de la caisse -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Solde Caisse</h5>
              <p class="card-text amount">{{ formatMontant(caisse.solde) }} FCFA</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Transactions du jour</h5>
              <p class="card-text amount">{{ caisse.transactions }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Date & Heure</h5>
              <p class="card-text">{{ dateHeure }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="row">
        <div class="col-12">
          <router-view></router-view>
        </div>
      </div>

      <!-- Modal Fonds de Caisse -->
      <FondsModal 
        v-if="showFondsModal" 
        :caisse="caisse"
        @close="showFondsModal = false"
        @save="saveFonds"
      />
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import FondsModal from '@/components/caisse/FondsModal.vue'
import api from '@/utils/api'

export default {
  name: 'CaisseVue',
  components: {
    DashboardLayout,
    FondsModal
  },
  setup() {
    const showFondsModal = ref(false)
    const caisse = ref({
      id: null,
      solde: 0,
      transactions: 0,
      etat: 'fermée'
    })
    const dateHeure = ref('')
    let timer = null

    const menuItems = [
      { 
        name: 'tickets', 
        label: 'Tickets', 
        path: '/caisse/tickets',
        icon: 'fas fa-receipt'
      },
      { 
        name: 'paiement', 
        label: 'Paiement', 
        path: '/caisse/paiement',
        icon: 'fas fa-cash-register'
      },
      { 
        name: 'fonds', 
        label: 'Fonds de Caisse', 
        path: '/caisse/fonds',
        icon: 'fas fa-money-bill-wave'
      },
      { 
        name: 'rapports', 
        label: 'Rapports', 
        path: '/caisse/rapports',
        icon: 'fas fa-chart-bar'
      }
    ]

    const updateDateTime = () => {
      const now = new Date()
      dateHeure.value = now.toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'medium'
      })
    }

    const formatMontant = (montant) => {
      return new Intl.NumberFormat('fr-FR').format(montant)
    }

    const fetchCaisseInfo = async () => {
      try {
        const response = await api.get('/caisse/info')
        caisse.value = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de caisse:', error)
      }
    }

    const saveFonds = async (data) => {
      try {
        await api.post('/caisse/fonds', data)
        await fetchCaisseInfo()
        showFondsModal.value = false
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des fonds:', error)
      }
    }

    onMounted(() => {
      fetchCaisseInfo()
      updateDateTime()
      timer = setInterval(updateDateTime, 1000)
    })

    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })

    return {
      showFondsModal,
      caisse,
      dateHeure,
      menuItems,
      formatMontant,
      saveFonds
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.card-title {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6600;
  margin: 0;
}

.btn-primary {
  background-color: #ff6600;
  border-color: #ff6600;
}

.btn-primary:hover {
  background-color: #e65c00;
  border-color: #e65c00;
}

/* Animation pour les mises à jour de montants */
.amount {
  transition: color 0.3s ease;
}

.amount.updated {
  color: #28a745;
}
</style>
