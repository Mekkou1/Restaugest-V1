<template>
    <div class="details-commande-view">
      <h1 class="text-center mb-4">Détails de la commande</h1>
      <h2>Ticket: {{ ticket }}</h2>
      <p>Table: {{ table }}</p>
      <p>Etat: {{ etat }}</p>
      <p>Créé le: {{ timestamps.created }}</p>
      <p v-if="timestamps.validated">Validé le: {{ timestamps.validated }}</p>
      <p v-if="timestamps.served">Servi le: {{ timestamps.served }}</p>
      <p v-if="timestamps.cancelled">Annulé le: {{ timestamps.cancelled }}</p>
      <h3>Articles:</h3>
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="article in articles" :key="article.nom">
          <span>{{ article.nom }} - {{ article.prix }} FCFA ({{ article.quantite }}x)</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'CommandeDetails',
    props: ['ticket'],
    data() {
      return {
        commande: {},
      };
    },
    methods: {
      async fetchCommande() {
        try {
          const response = await axios.get(`http://localhost:5000/api/commandes/${this.ticket}`);
          this.commande = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération de la commande:', error);
        }
      },
    },
    computed: {
      table() {
        return this.commande.table || 'Table inconnue';
      },
      etat() {
        return this.commande.etat || 'Etat inconnu';
      },
      articles() {
        return this.commande.articles || [];
      },
      timestamps() {
        return {
          created: this.commande.created_at,
          validated: this.commande.validated_at,
          served: this.commande.served_at,
          cancelled: this.commande.cancelled_at,
        };
      },
    },
    created() {
      this.fetchCommande();
    },
  };
  </script>
  
  <style>
  .details-commande-view {
    font-family: Arial, sans-serif;
    padding: 20px;
  }
  .list-group {
    margin-top: 20px;
  }
  </style>
  