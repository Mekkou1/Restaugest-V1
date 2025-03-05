<template>
    <div class="serveur-dashboard p-4">
      <!-- Stats rapides -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Service en cours</h3>
          <p class="text-xl font-semibold">{{ currentService }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Tables assignées</h3>
          <p class="text-xl font-semibold">{{ assignedTables.length }}/{{ totalTables }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Commandes actives</h3>
          <p class="text-xl font-semibold">{{ activeOrders.length }}</p>
        </div>
      </div>
  
      <!-- Plan de salle -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Plan de salle</h2>
          <div class="flex space-x-2">
            <button 
              v-for="salle in salles" 
              :key="salle.id"
              @click="selectSalle(salle.id)"
              :class="[
                'px-4 py-2 rounded-lg',
                currentSalle === salle.id ? 'bg-primary-600 text-white' : 'bg-gray-100'
              ]"
            >
              {{ salle.nom }}
            </button>
          </div>
        </div>
  
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="table in filteredTables" 
            :key="table.id"
            @click="handleTableClick(table)"
            :class="[
              'p-3 rounded-lg cursor-pointer',
              getTableStatusClass(table)
            ]"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">Table {{ table.numero }}</span>
              <span class="text-sm">{{ table.capacite }} pers.</span>
            </div>
            <div v-if="table.status !== 'libre'" class="mt-2 text-sm">
              <p>{{ getTableInfo(table) }}</p>
              <p class="text-xs mt-1">{{ formatTime(table.lastUpdate) }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Liste des commandes -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Commandes en cours</h2>
        <div class="space-y-4">
          <div 
            v-for="order in activeOrders" 
            :key="order.id"
            class="p-4 rounded-lg border border-gray-200"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">Table {{ order.table_numero }}</h3>
                <p class="text-sm text-gray-600">{{ order.items.length }} articles</p>
              </div>
              <div :class="getOrderStatusClass(order.status)">
                {{ order.status }}
              </div>
            </div>
            <div class="mt-2">
              <button 
                @click="viewOrder(order.id)"
                class="text-primary-600 hover:text-primary-700"
              >
                Voir détails
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
  
  export default {
    name: 'ServeurDashboard',
  
    setup() {
      const store = useStore();
      const router = useRouter();
  
      const currentService = ref('Service du midi');
      const currentSalle = ref(null);
      const salles = ref([]);
      const tables = ref([]);
      const activeOrders = ref([]);
  
      const assignedTables = computed(() => {
        return tables.value.filter(table => table.serveur_id === store.state.auth.user.id);
      });
  
      const totalTables = computed(() => tables.value.length);
  
      const filteredTables = computed(() => {
        if (!currentSalle.value) return tables.value;
        return tables.value.filter(table => table.salle_id === currentSalle.value);
      });
  
      const selectSalle = (salleId) => {
        currentSalle.value = salleId;
      };
  
      const handleTableClick = (table) => {
        router.push(`/serveur/table/${table.id}`);
      };
  
      const viewOrder = (orderId) => {
        router.push(`/serveur/commande/${orderId}`);
      };
  
      const getTableStatusClass = (table) => {
        const classes = {
          libre: 'bg-green-50 border-green-200',
          occupee: 'bg-red-50 border-red-200',
          reservee: 'bg-yellow-50 border-yellow-200'
        };
        return classes[table.status] || 'bg-gray-50 border-gray-200';
      };
  
      const getOrderStatusClass = (status) => {
        const classes = {
          'en_attente': 'text-yellow-600',
          'en_preparation': 'text-blue-600',
          'pret': 'text-green-600'
        };
        return classes[status] || 'text-gray-600';
      };
  
      const getTableInfo = (table) => {
        if (table.status === 'occupee') {
          return `${table.couverts} couverts - ${formatTime(table.heure_arrivee)}`;
        }
        if (table.status === 'reservee') {
          return `Réservée pour ${formatTime(table.heure_reservation)}`;
        }
        return '';
      };
  
      const formatTime = (time) => {
        return new Date(time).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };
  
      onMounted(async () => {
        try {
          await Promise.all([
            store.dispatch('serveur/fetchSalles').then(response => {
              salles.value = response;
              if (response.length > 0) {
                currentSalle.value = response[0].id;
              }
            }),
            store.dispatch('serveur/fetchTables').then(response => {
              tables.value = response;
            }),
            store.dispatch('serveur/fetchActiveOrders').then(response => {
              activeOrders.value = response;
            })
          ]);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      });
  
      return {
        currentService,
        currentSalle,
        salles,
        assignedTables,
        totalTables,
        filteredTables,
        activeOrders,
        selectSalle,
        handleTableClick,
        viewOrder,
        getTableStatusClass,
        getOrderStatusClass,
        getTableInfo,
        formatTime
      };
    }
  };
  </script>
  
  <style scoped>
  .serveur-dashboard {
    min-height: calc(100vh - 64px);
    background-color: #f8f9fa;
  }
  </style>
  