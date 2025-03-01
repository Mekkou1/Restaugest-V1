<template>
    <div class="commande-view">
      <h1 class="text-center mb-4">Etat des commandes</h1>
      <h2>Commandes du jour</h2>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Ticket</th>
            <th>Heure</th>
            <th>Etat</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="commande in commandes" :key="commande.ticket" @click="goToDetails(commande.ticket)">
            <td>{{ commande.date }}</td>
            <td>{{ commande.ticket }}</td>
            <td>{{ commande.heure }}</td>
            <td>{{ commande.etat }}</td>
            <td>
              <button v-if="commande.etat === 'Prête'" class="btn btn-primary" @click.stop="servir(commande.ticket)">Servir</button>
              <button v-if="commande.etat !== 'Servie' && commande.etat !== 'Annulée'" class="btn btn-danger" @click.stop="annuler(commande.ticket)">Annuler</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'CommandeListe',
    data() {
      return {
        commandes: [],
      };
    },
    methods: {
      async fetchCommandes() {
        try {
          const response = await axios.get('http://localhost:5000/api/commandes');
          this.commandes = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération des commandes:', error);
        }
      },
      goToDetails(ticket) {
        this.$router.push({ name: 'DetailsCommande', params: { ticket } });
      },
      servir(ticket) {
        const commande = this.commandes.find(c => c.ticket === ticket);
        if (commande) {
          commande.etat = 'Servie';
          commande.timestamps.served = new Date().toISOString();
        }
      },
      annuler(ticket) {
        const commande = this.commandes.find(c => c.ticket === ticket);
        if (commande) {
          commande.etat = 'Annulée';
          commande.timestamps.cancelled = new Date().toISOString();
        }
      },
    },
    created() {
      this.fetchCommandes();
    },
  };
  </script>
  
  <style>
  .commande-view {
    font-family: Arial, sans-serif;
    padding: 20px;
  }
  .table {
    margin-top: 20px;
  }
  </style>
  