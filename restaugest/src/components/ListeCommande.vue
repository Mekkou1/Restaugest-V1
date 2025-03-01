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
          <th>Etats</th>
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
export default {
  name: 'ListeCommande',
  data() {
    return {
      commandes: [
        {
          date: '27/01/2025',
          ticket: '001/27012025',
          heure: '10:25',
          etat: 'Prête',
          table: 'Terrasse 1',
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
          date: '27/01/2025',
          ticket: '002/27012025',
          heure: '11:00',
          etat: 'En préparation',
          table: 'Terrasse 2',
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
          date: '27/01/2025',
          ticket: '003/27012025',
          heure: '11:30',
          etat: 'Servie',
          table: 'VIP 1',
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
          date: '27/01/2025',
          ticket: '004/27012025',
          heure: '12:00',
          etat: 'Annulée',
          table: 'VIP 2',
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
  methods: {
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
