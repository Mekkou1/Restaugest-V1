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
export default {
  name: 'DetailsCommande',
  props: ['ticket'],
  data() {
    return {
      commandes: [
        {
          ticket: '001/27012025',
          table: 'Terrasse 1',
          etat: 'Prête',
          articles: [
            { nom: 'Salade César', prix: 3000, quantite: 1 },
            { nom: 'Coca-Cola', prix: 1000, quantite: 2 },
          ],
          timestamps: {
            created: '2025-01-27T10:25:00Z',
            validated: '2025-01-27T10:30:00Z',
            served: null,
            cancelled: null,
          },
        },
        {
          ticket: '002/27012025',
          table: 'Terrasse 2',
          etat: 'En préparation',
          articles: [
            { nom: 'Poulet Rôti', prix: 7000, quantite: 1 },
            { nom: 'Tarte aux pommes', prix: 2500, quantite: 1 },
          ],
          timestamps: {
            created: '2025-01-27T11:00:00Z',
            validated: null,
            served: null,
            cancelled: null,
          },
        },
        {
          ticket: '003/27012025',
          table: 'VIP 1',
          etat: 'Servie',
          articles: [
            { nom: 'Gaspacho Andalou', prix: 3000, quantite: 1 },
            { nom: 'Champagne', prix: 5000, quantite: 1 },
          ],
          timestamps: {
            created: '2025-01-27T11:30:00Z',
            validated: '2025-01-27T11:35:00Z',
            served: '2025-01-27T11:40:00Z',
            cancelled: null,
          },
        },
        {
          ticket: '004/27012025',
          table: 'VIP 2',
          etat: 'Annulée',
          articles: [
            { nom: 'Salade César', prix: 3000, quantite: 1 },
            { nom: 'Coca-Cola', prix: 1000, quantite: 2 },
          ],
          timestamps: {
            created: '2025-01-27T12:00:00Z',
            validated: null,
            served: null,
            cancelled: '2025-01-27T12:05:00Z',
          },
        },
      ],
    };
  },
  computed: {
    commande() {
      return this.commandes.find(c => c.ticket === this.ticket) || {};
    },
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
      return this.commande.timestamps || {};
    },
  },
};
</script>

<style>
.details-commande-view {
  font-family: Arial, sans-serif;
  padding: 20px;
}
</style>
