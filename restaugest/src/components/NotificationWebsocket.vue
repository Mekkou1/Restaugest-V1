<template>
    <div v-if="notificationMessage" class="notification">
      {{ notificationMessage }}
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotificationWebsocket',
    data() {
      return {
        ws: null,
        notificationMessage: ""
      };
    },
    mounted() {
      this.connectWebSocket();
    },
    methods: {
      connectWebSocket() {
        this.ws = new WebSocket("ws://localhost:5000");
  
        this.ws.onopen = () => {
          console.log("Connected to WebSocket server");
        };
  
        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.message === "Nouvelle commande") {
            this.notificationMessage = `Nouvelle commande reçue avec le ticket ID: ${message.ticket_id}`;
            setTimeout(() => {
              this.notificationMessage = "";
            }, 5000); // Effacer la notification après 5 secondes
          }
        };
  
        this.ws.onclose = () => {
          console.log("Disconnected from WebSocket server");
          setTimeout(this.connectWebSocket, 5000);
        };
  
        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .notification {
    position: fixed;
    bottom: 10px;
    right: 10px;
    background-color: #28a745;
    color: #fff;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  </style>
  