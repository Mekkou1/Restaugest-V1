<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <!-- Notifications -->
    <TransitionGroup 
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300',
          notificationTypeClasses[notification.type] || 'bg-gray-700 text-white'
        ]"
      >
        <div class="flex items-start">
          <!-- Icône -->
          <div class="flex-shrink-0">
            <component
              :is="notificationIcons[notification.type]"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </div>

          <!-- Contenu -->
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium">
              {{ notification.title }}
            </p>
            <p class="mt-1 text-sm opacity-90">
              {{ notification.message }}
            </p>
            <p v-if="notification.timestamp" class="mt-1 text-xs opacity-75">
              {{ formatDate(notification.timestamp) }}
            </p>
          </div>

          <!-- Bouton fermer -->
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeNotification(notification.id)"
              class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="sr-only">Fermer</span>
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import io from 'socket.io-client';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

export default {
  name: 'NotificationWebsocket',
  
  components: {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XMarkIcon
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const socket = ref(null);
    const notifications = ref([]);

    // Classes CSS pour les différents types de notifications
    const notificationTypeClasses = {
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-500 text-white',
      success: 'bg-green-600 text-white',
      info: 'bg-blue-600 text-white',
      stock_low: 'bg-orange-500 text-white',
      stock_out: 'bg-red-600 text-white',
      recipe_update: 'bg-purple-600 text-white',
      order_ready: 'bg-green-600 text-white'
    };

    // Icônes pour les différents types de notifications
    const notificationIcons = {
      error: ExclamationTriangleIcon,
      warning: ExclamationTriangleIcon,
      success: CheckCircleIcon,
      info: InformationCircleIcon,
      stock_low: ExclamationTriangleIcon,
      stock_out: ExclamationTriangleIcon,
      recipe_update: InformationCircleIcon,
      order_ready: CheckCircleIcon
    };

    // Connexion au serveur WebSocket
    const connectWebSocket = () => {
      const token = store.state.auth.token;
      if (!token) return;

      socket.value = io(process.env.VUE_APP_API_URL, {
        auth: { token }
      });

      // Gestion des événements de connexion
      socket.value.on('connect', () => {
        console.log('WebSocket connecté');
        joinRooms();
      });

      socket.value.on('connect_error', (error) => {
        console.error('Erreur de connexion WebSocket:', error);
        addNotification({
          type: 'error',
          title: 'Erreur de connexion',
          message: 'Impossible de se connecter au serveur de notifications'
        });
      });

      // Événements de stock
      socket.value.on('stockBas', (data) => {
        addNotification({
          type: 'stock_low',
          title: 'Stock bas',
          message: `Le stock de ${data.intrant.nom} est bas (${data.intrant.stock_actuel} ${data.intrant.unite})`,
          timestamp: data.timestamp
        });
      });

      socket.value.on('stockEpuise', (data) => {
        addNotification({
          type: 'stock_out',
          title: 'Stock épuisé',
          message: `Le stock de ${data.intrant.nom} est épuisé`,
          timestamp: data.timestamp
        });
      });

      // Événements de recettes
      socket.value.on('recetteModifiee', (data) => {
        addNotification({
          type: 'recipe_update',
          title: 'Recette modifiée',
          message: `La recette "${data.recette.nom}" a été mise à jour`,
          timestamp: data.timestamp
        });
      });

      // Événements de commandes
      socket.value.on('commandePrete', (data) => {
        addNotification({
          type: 'order_ready',
          title: 'Commande prête',
          message: `La commande #${data.commande.numero} est prête à être servie`,
          timestamp: data.timestamp
        });
      });
    };

    // Rejoindre les rooms appropriées selon le rôle de l'utilisateur
    const joinRooms = () => {
      const role = store.state.auth.user?.role;
      if (!role || !socket.value) return;

      const rooms = {
        Administrateur: ['admin', 'cuisine'],
        Cuisinier: ['cuisine'],
        Serveur: ['serveurs'],
        Caissier: ['caisse']
      };

      if (rooms[role]) {
        rooms[role].forEach(room => {
          socket.value.emit('joinRoom', room);
        });
      }
    };

    // Ajouter une notification
    const addNotification = (notification) => {
      const id = Math.random().toString(36).substr(2, 9);
      notifications.value.push({
        id,
        ...notification
      });

      // Supprimer la notification après un délai
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    };

    // Supprimer une notification
    const removeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    };

    // Formater la date
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };

    // Cycle de vie du composant
    onMounted(() => {
      connectWebSocket();
    });

    onUnmounted(() => {
      if (socket.value) {
        socket.value.disconnect();
      }
    });

    return {
      notifications,
      notificationTypeClasses,
      notificationIcons,
      removeNotification,
      formatDate
    };
  }
};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
