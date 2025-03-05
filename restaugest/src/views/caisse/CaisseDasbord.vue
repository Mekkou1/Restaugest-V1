<template>
    <div class="caisse-dashboard p-4">
      <!-- Stats de la caisse -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Total du jour</h3>
              <p class="text-2xl font-semibold">{{ formatPrice(stats.dailyTotal) }}</p>
            </div>
            <div class="text-green-500 bg-green-100 rounded-full p-3">
              <i class="fas fa-euro-sign text-xl"></i>
            </div>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Tickets en attente</h3>
              <p class="text-2xl font-semibold">{{ stats.pendingTickets }}</p>
            </div>
            <div class="text-orange-500 bg-orange-100 rounded-full p-3">
              <i class="fas fa-receipt text-xl"></i>
            </div>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Tickets réglés</h3>
              <p class="text-2xl font-semibold">{{ stats.paidTickets }}</p>
            </div>
            <div class="text-blue-500 bg-blue-100 rounded-full p-3">
              <i class="fas fa-check-circle text-xl"></i>
            </div>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Ticket moyen</h3>
              <p class="text-2xl font-semibold">{{ formatPrice(stats.averageTicket) }}</p>
            </div>
            <div class="text-purple-500 bg-purple-100 rounded-full p-3">
              <i class="fas fa-calculator text-xl"></i>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Actions rapides -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Actions rapides</h2>
          <div class="grid grid-cols-2 gap-4">
            <button 
              v-for="action in quickActions" 
              :key="action.name"
              @click="action.handler"
              class="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i :class="[action.icon, 'text-xl mr-3', action.color]"></i>
              <span>{{ action.name }}</span>
            </button>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">État de la caisse</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span>Fonds de caisse</span>
              <span class="font-semibold">{{ formatPrice(cashierStats.float) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Espèces en caisse</span>
              <span class="font-semibold">{{ formatPrice(cashierStats.cash) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>CB</span>
              <span class="font-semibold">{{ formatPrice(cashierStats.card) }}</span>
            </div>
            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between items-center">
                <span class="font-medium">Total</span>
                <span class="font-semibold">{{ formatPrice(cashierStats.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Tickets en attente -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Tickets en attente</h2>
          <button 
            @click="$router.push('/caisse/tickets')"
            class="text-primary-600 hover:text-primary-700"
          >
            Voir tout
          </button>
        </div>
        <div class="space-y-4">
          <div 
            v-for="ticket in pendingTickets" 
            :key="ticket.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:border-primary-500 cursor-pointer"
            @click="handleTicketClick(ticket)"
          >
            <div>
              <h3 class="font-medium">Table {{ ticket.table_numero }}</h3>
              <p class="text-sm text-gray-600">{{ ticket.items.length }} articles</p>
            </div>
            <div>
              <p class="font-semibold">{{ formatPrice(ticket.total) }}</p>
              <p class="text-sm text-gray-500">{{ formatTime(ticket.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'CaisseDashboard',
  
    setup() {
      const store = useStore();
      const router = useRouter();
  
      const stats = ref({
        dailyTotal: 0,
        pendingTickets: 0,
        paidTickets: 0,
        averageTicket: 0
      });
  
      const cashierStats = ref({
        float: 0,
        cash: 0,
        card: 0,
        total: 0
      });
  
      const pendingTickets = ref([]);
  
      const quickActions = [
        {
          name: 'Nouveau ticket',
          icon: 'fas fa-plus',
          color: 'text-green-500',
          handler: () => router.push('/caisse/tickets/nouveau')
        },
        {
          name: 'Clôture caisse',
          icon: 'fas fa-cash-register',
          color: 'text-blue-500',
          handler: () => router.push('/caisse/cloture')
        },
        {
          name: 'Remise en banque',
          icon: 'fas fa-money-bill-wave',
          color: 'text-purple-500',
          handler: () => router.push('/caisse/remise')
        },
        {
          name: 'Rapports',
          icon: 'fas fa-chart-bar',
          color: 'text-orange-500',
          handler: () => router.push('/caisse/rapports')
        }
      ];
  
      const formatPrice = (value) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);
      };
  
      const formatTime = (time) => {
        return new Date(time).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      const handleTicketClick = (ticket) => {
        router.push(`/caisse/tickets/${ticket.id}`);
      };
  
      const loadDashboardData = async () => {
        try {
          const [dashboardStats, cashStats, tickets] = await Promise.all([
            store.dispatch('caisse/fetchDashboardStats'),
            store.dispatch('caisse/fetchCashierStats'),
            store.dispatch('caisse/fetchPendingTickets')
          ]);
  
          stats.value = dashboardStats;
          cashierStats.value = cashStats;
          pendingTickets.value = tickets;
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      };
  
      onMounted(() => {
        loadDashboardData();
      });
  
      return {
        stats,
        cashierStats,
        pendingTickets,
        quickActions,
        formatPrice,
        formatTime,
        handleTicketClick
      };
    }
  };
  </script>
  
  <style scoped>
  .caisse-dashboard {
    min-height: calc(100vh - 64px);
    background-color: #f8f9fa;
  }
  </style>
  