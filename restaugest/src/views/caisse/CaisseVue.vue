<template>
  <div class="caisse-view">
    <!-- En-tête avec informations de la caisse -->
    <header class="caisse-header">
      <div class="caisse-info">
        <h1>{{ caisse.nom }}</h1>
        <div class="status-badge" :class="getStatusClass">
          <i :class="getStatusIcon"></i>
          {{ caisse.etat }}
        </div>
      </div>
      <div class="caisse-actions">
        <button 
          v-if="caisse.etat === 'FERMEE'"
          class="btn btn-success"
          @click="ouvrirCaisse"
        >
          <i class="fas fa-door-open"></i>
          Ouvrir la caisse
        </button>
        <button 
          v-else-if="caisse.etat === 'OUVERTE'"
          class="btn btn-warning"
          @click="fermerCaisse"
        >
          <i class="fas fa-door-closed"></i>
          Fermer la caisse
        </button>
      </div>
    </header>

    <!-- Menu principal -->
    <nav class="caisse-nav">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </nav>

    <!-- Contenu principal -->
    <main class="caisse-content">
      <!-- Tickets -->
      <TicketManager 
        v-if="activeTab === 'tickets'"
        :caisse="caisse"
      />

      <!-- Avoirs -->
      <AvoirManager 
        v-else-if="activeTab === 'avoirs'"
        :caisse="caisse"
      />

      <!-- Fonds -->
      <FondsManager 
        v-else-if="activeTab === 'fonds'"
        :caisse="caisse"
      />

      <!-- Transferts -->
      <TransfertManager 
        v-else-if="activeTab === 'transferts'"
        :caisse="caisse"
      />

      <!-- Journal -->
      <JournalCaisse 
        v-else-if="activeTab === 'journal'"
        :caisse="caisse"
      />

      <!-- Rapports -->
      <RapportsCaisse 
        v-else-if="activeTab === 'rapports'"
        :caisse="caisse"
      />

      <!-- Statistiques -->
      <StatsCaisse 
        v-else-if="activeTab === 'stats'"
        :caisse="caisse"
      />

      <!-- Configuration -->
      <ConfigCaisse 
        v-else-if="activeTab === 'config'"
        :caisse="caisse"
      />
    </main>

    <!-- Alertes -->
    <AlertesCaisse 
      v-if="showAlertes"
      :caisse="caisse"
      @close="showAlertes = false"
    />

    <!-- Modal d'ouverture -->
    <FondsModal 
      v-if="showFondsModal"
      :caisse="caisse"
      @close="showFondsModal = false"
      @submit="confirmerOuverture"
    />

    <!-- Modal de clôture -->
    <ClotureManager 
      v-if="showClotureModal"
      :caisse="caisse"
      @close="showClotureModal = false"
      @submit="confirmerFermeture"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// Composants
import TicketManager from '@/components/caisse/TicketManager.vue';
import AvoirManager from '@/components/caisse/AvoirManager.vue';
import FondsManager from '@/components/caisse/FondsManager.vue';
import TransfertManager from '@/components/caisse/TransfertManager.vue';
import JournalCaisse from '@/components/caisse/JournalCaisse.vue';
import RapportsCaisse from '@/components/caisse/RapportsCaisse.vue';
import StatsCaisse from '@/components/caisse/StatsCaisse.vue';
import ConfigCaisse from '@/components/caisse/ConfigCaisse.vue';
import AlertesCaisse from '@/components/caisse/AlertesCaisse.vue';
import FondsModal from '@/components/caisse/FondsModal.vue';
import ClotureManager from '@/components/caisse/ClotureManager.vue';

import api from '@/utils/api';

export default {
  name: 'CaisseView',

  components: {
    TicketManager,
    AvoirManager,
    FondsManager,
    TransfertManager,
    JournalCaisse,
    RapportsCaisse,
    StatsCaisse,
    ConfigCaisse,
    AlertesCaisse,
    FondsModal,
    ClotureManager
  },

  setup() {
    const store = useStore();
    const router = useRouter();

    // État
    const caisse = ref({
      id: null,
      nom: '',
      etat: 'FERMEE',
      solde: 0
    });
    const activeTab = ref('tickets');
    const showAlertes = ref(false);
    const showFondsModal = ref(false);
    const showClotureModal = ref(false);
    let pollingInterval = null;

    // Onglets disponibles
    const tabs = [
      { id: 'tickets', label: 'Tickets', icon: 'fas fa-receipt' },
      { id: 'avoirs', label: 'Avoirs', icon: 'fas fa-ticket-alt' },
      { id: 'fonds', label: 'Fonds', icon: 'fas fa-money-bill-wave' },
      { id: 'transferts', label: 'Transferts', icon: 'fas fa-exchange-alt' },
      { id: 'journal', label: 'Journal', icon: 'fas fa-history' },
      { id: 'rapports', label: 'Rapports', icon: 'fas fa-chart-bar' },
      { id: 'stats', label: 'Statistiques', icon: 'fas fa-chart-line' },
      { id: 'config', label: 'Configuration', icon: 'fas fa-cog' }
    ];

    // Computed
    const getStatusClass = computed(() => {
      return {
        'status-open': caisse.value.etat === 'OUVERTE',
        'status-closed': caisse.value.etat === 'FERMEE'
      };
    });

    const getStatusIcon = computed(() => {
      return caisse.value.etat === 'OUVERTE' ? 
        'fas fa-door-open' : 'fas fa-door-closed';
    });

    // Méthodes
    const loadCaisse = async () => {
      try {
        const response = await api.get('/caisse/current');
        caisse.value = response.data;
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors du chargement de la caisse'
        });
      }
    };

    const startPolling = () => {
      pollingInterval = setInterval(loadCaisse, 30000); // 30 secondes
    };

    const ouvrirCaisse = () => {
      showFondsModal.value = true;
    };

    const confirmerOuverture = async (data) => {
      try {
        await api.post('/caisse/ouvrir', data);
        await loadCaisse();
        showFondsModal.value = false;
        
        store.dispatch('showNotification', {
          type: 'success',
          message: 'Caisse ouverte avec succès'
        });
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de l\'ouverture de la caisse'
        });
      }
    };

    const fermerCaisse = () => {
      showClotureModal.value = true;
    };

    const confirmerFermeture = async (data) => {
      try {
        await api.post('/caisse/fermer', data);
        await loadCaisse();
        showClotureModal.value = false;
        
        store.dispatch('showNotification', {
          type: 'success',
          message: 'Caisse fermée avec succès'
        });
      } catch (error) {
        store.dispatch('showNotification', {
          type: 'error',
          message: 'Erreur lors de la fermeture de la caisse'
        });
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      loadCaisse();
      startPolling();
    });

    onBeforeUnmount(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    });

    return {
      caisse,
      activeTab,
      tabs,
      showAlertes,
      showFondsModal,
      showClotureModal,
      getStatusClass,
      getStatusIcon,
      ouvrirCaisse,
      confirmerOuverture,
      fermerCaisse,
      confirmerFermeture
    };
  }
};
</script>

<style scoped>
.caisse-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.caisse-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.caisse-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.caisse-info h1 {
  margin: 0;
  font-size: 1.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.caisse-actions {
  display: flex;
  gap: 1rem;
}

.caisse-nav {
  background: white;
  padding: 0 2rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 1rem;
  overflow-x: auto;
}

.nav-tab {
  padding: 1rem;
  border: none;
  background: none;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.nav-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: background-color 0.2s ease;
}

.nav-tab:hover {
  color: #ff6600;
}

.nav-tab.active {
  color: #ff6600;
}

.nav-tab.active::after {
  background: #ff6600;
}

.caisse-content {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #000;
}

/* Responsive */
@media (max-width: 768px) {
  .caisse-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .caisse-info {
    width: 100%;
    justify-content: space-between;
  }

  .caisse-actions {
    width: 100%;
  }

  .caisse-actions .btn {
    flex: 1;
  }

  .caisse-nav {
    padding: 0 1rem;
  }

  .nav-tab {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
