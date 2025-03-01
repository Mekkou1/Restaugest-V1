<template>
  <div class="tickets-du-jour container">
    <h2>Tickets du jour</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Num Ticket</th>
          <th>Désignation</th>
          <th>Total</th>
          <th>Généré par</th>
          <th>Action</th>
          <th>État</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="ticket in tickets"
          :key="ticket.numTicket"
          :class="{ 'highlight': ticket.etat === 'Servi-en attente de paiement' }"
          @click="ouvrirPaiement(ticket)"
        >
          <td>{{ ticket.numTicket }}</td>
          <td>{{ ticket.designation }}</td>
          <td>{{ ticket.total }}</td>
          <td>{{ ticket.generePar }}</td>
          <td>
            <button
              :disabled="ticket.action === 'En cuisine'"
              @click.stop="envoyerEnCuisine(ticket)"
              class="btn btn-primary"
            >
              Cuisine
            </button>
          </td>
          <td>{{ ticket.etat }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ListeTickets',
  data() {
    return {
      tickets: []
    };
  },
  mounted() {
    this.chargerTickets();
  },
  methods: {
    async chargerTickets() {
      try {
        // Récupérer les tickets
        const ticketsResponse = await axios.get('http://localhost:5000/api/tickets');
        const tickets = ticketsResponse.data;

        if (tickets.length === 0) {
          console.log('Aucun ticket trouvé.');
          this.tickets = []; // Assurez-vous que la liste est vide
          return;
        }

        // Pour chaque ticket, récupérer les détails nécessaires
        for (const ticket of tickets) {
          try {
            // Récupérer le nom de la table
            const tableResponse = await axios.get(`http://localhost:5000/api/tables/${ticket.table_id}`);
            const tableNom = tableResponse.data ? tableResponse.data.nom : 'Table Inconnue';

            // Récupérer le total des commandes
            const commandesResponse = await axios.get(`http://localhost:5000/api/commandes?ticket_id=${ticket.id}`);
            const total = commandesResponse.data.length > 0
              ? commandesResponse.data.reduce((total, commande) => total + commande.prix * commande.quantite, 0)
              : 0;

            // Récupérer le générateur du ticket
            const historiqueResponse = await axios.get(`http://localhost:5000/api/historique_tickets?ticket_id=${ticket.id}`);
            const generePar = historiqueResponse.data.length > 0 ? historiqueResponse.data[0].utilisateur_id : 'Inconnu';

            // Ajouter le ticket à la liste
            this.tickets.push({
              numTicket: ticket.reference, // Utilisez la référence du ticket
              designation: `Commande Table ${tableNom}`,
              total: total,
              generePar: generePar,
              action: ticket.etat === 'En cuisine' ? 'En cuisine' : '',
              etat: ticket.etat
            });
          } catch (error) {
            console.error(`Erreur lors du traitement du ticket ID ${ticket.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
        this.tickets = []; // Assurez-vous que la liste est vide en cas d'erreur
      }
    },
    envoyerEnCuisine(ticket) {
      ticket.action = 'En cuisine';
      // Mettre à jour l'état du ticket dans la base de données
      axios.put(`http://localhost:5000/api/tickets/${ticket.numTicket}/prepare`);
    },
    ouvrirPaiement(ticket) {
      this.$router.push({ name: 'PayementVue', params: { ticket } });
    }
  }
};
</script>

<style scoped>
.tickets-du-jour {
  background-color: orange;
  padding: 20px;
}
.highlight {
  background-color: yellow;
}
</style>
