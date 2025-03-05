<template>
    <div class="cuisine-dashboard p-4">
      <!-- Stats rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Commandes en attente</h3>
              <p class="text-2xl font-semibold">{{ stats.pendingOrders }}</p>
            </div>
            <div class="text-orange-500 bg-orange-100 rounded-full p-3">
              <i class="fas fa-clock text-xl"></i>
            </div>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">En préparation</h3>
              <p class="text-2xl font-semibold">{{ stats.inProgressOrders }}</p>
            </div>
            <div class="text-blue-500 bg-blue-100 rounded-full p-3">
              <i class="fas fa-fire text-xl"></i>
            </div>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Prêt à servir</h3>
              <p class="text-2xl font-semibold">{{ stats.readyOrders }}</p>
            </div>
            <div class="text-green-500 bg-green-100 rounded-full p-3">
              <i class="fas fa-check text-xl"></i>
            </div>
          </div>
        </div>
  
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-500 text-sm">Temps moyen</h3>
              <p class="text-2xl font-semibold">{{ stats.averageTime }} min</p>
            </div>
            <div class="text-purple-500 bg-purple-100 rounded-full p-3">
              <i class="fas fa-stopwatch text-xl"></i>
            </div>
          </div>
        </div>
      </div>
  
      <!-- File d'attente des commandes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Commandes en attente -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4 text-orange-600">
            <i class="fas fa-clock mr-2"></i>En attente
          </h2>
          <div class="space-y-4">
            <div 
              v-for="order in pendingOrders" 
              :key="order.id"
              class="order-card p-4 border border-orange-200 rounded-lg hover:border-orange-400 cursor-pointer"
              @click="startOrder(order)"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium">Table {{ order.table_numero }}</h3>
                <span class="text-sm text-gray-500">{{ formatTime(order.created_at) }}</span>
              </div>
              <ul class="space-y-2">
                <li 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="flex justify-between text-sm"
                >
                  <span>{{ item.quantity }}x {{ item.name }}</span>
                  <span class="text-gray-500">{{ item.notes }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        <!-- En préparation -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4 text-blue-600">
            <i class="fas fa-fire mr-2"></i>En préparation
          </h2>
          <div class="space-y-4">
            <div 
              v-for="order in inProgressOrders" 
              :key="order.id"
              class="order-card p-4 border border-blue-200 rounded-lg"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium">Table {{ order.table_numero }}</h3>
                <div class="text-sm">
                  <div class="text-gray-500">{{ formatTime(order.start_time) }}</div>
                  <div class="countdown" :class="getCountdownClass(order)">
                    {{ formatDuration(order.elapsed_time) }}
                  </div>
                </div>
              </div>
              <ul class="space-y-2">
                <li 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="flex justify-between items-center text-sm"
                >
                  <span>{{ item.quantity }}x {{ item.name }}</span>
                  <button 
                    @click="completeItem(order.id, item.id)"
                    :class="[
                      'px-2 py-1 rounded text-xs',
                      item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                    ]"
                  >
                    <i :class="item.completed ? 'fas fa-check' : 'fas fa-circle'"></i>
                  </button>
                </li>
              </ul>
              <div class="mt-4 flex justify-end">
                <button 
                  @click="completeOrder(order)"
                  class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Prêt à servir -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4 text-green-600">
            <i class="fas fa-check mr-2"></i>Prêt à servir
          </h2>
          <div class="space-y-4">
            <div 
              v-for="order in readyOrders" 
              :key="order.id"
              class="order-card p-4 border border-green-200 rounded-lg"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium">Table {{ order.table_numero }}</h3>
                <span class="text-sm text-gray-500">{{ formatTime(order.completed_at) }}</span>
              </div>
              <ul class="space-y-2">
                <li 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="text-sm text-gray-600"
                >
                  {{ item.quantity }}x {{ item.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useStore } from 'vuex';
  
  export default {
    name: 'CuisineDashboard',
  
    setup() {
      const store = useStore();
      let refreshInterval = null;
  
      const stats = ref({
        pendingOrders: 0,
        inProgressOrders: 0,
        readyOrders: 0,
        averageTime: 0
      });
  
      const pendingOrders = ref([]);
      const inProgressOrders = ref([]);
      const readyOrders = ref([]);
  
      const formatTime = (time) => {
        return new Date(time).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      };
  
      const getCountdownClass = (order) => {
        const elapsed = order.elapsed_time;
        if (elapsed > 900) return 'text-red-600'; // Plus de 15 minutes
        if (elapsed > 600) return 'text-orange-600'; // Plus de 10 minutes
        return 'text-gray-600';
      };
  
      const startOrder = async (order) => {
        try {
          await store.dispatch('cuisine/startOrder', order.id);
          await loadOrders();
        } catch (error) {
          console.error('Error starting order:', error);
        }
      };
  
      const completeItem = async (orderId, itemId) => {
        try {
          await store.dispatch('cuisine/completeOrderItem', { orderId, itemId });
          await loadOrders();
        } catch (error) {
          console.error('Error completing item:', error);
        }
      };
  
      const completeOrder = async (order) => {
        try {
          await store.dispatch('cuisine/completeOrder', order.id);
          await loadOrders();
        } catch (error) {
          console.error('Error completing order:', error);
        }
      };
  
      const loadOrders = async () => {
        try {
          const [dashboardStats, orders] = await Promise.all([
            store.dispatch('cuisine/fetchStats'),
            store.dispatch('cuisine/fetchOrders')
          ]);
  
          stats.value = dashboardStats;
          pendingOrders.value = orders.pending;
          inProgressOrders.value = orders.inProgress;
          readyOrders.value = orders.ready;
        } catch (error) {
          console.error('Error loading orders:', error);
        }
      };
  
      onMounted(() => {
        loadOrders();
        refreshInterval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
      });
  
      onUnmounted(() => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      });
  
      return {
        stats,
        pendingOrders,
        inProgressOrders,
        readyOrders,
        formatTime,
        formatDuration,
        getCountdownClass,
        startOrder,
        completeItem,
        completeOrder
      };
    }
  };
  </script>
  
  <style scoped>
  .cuisine-dashboard {
    min-height: calc(100vh - 64px);
    background-color: #f8f9fa;
  }
  
  .order-card {
    transition: all 0.2s ease;
  }
  
  .order-card:hover {
    transform: translateY(-2px);
  }
  
  .countdown {
    font-family: monospace;
    font-weight: 600;
  }
  </style>
  