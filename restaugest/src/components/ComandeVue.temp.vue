<template>
  <!-- Le template reste inchangé -->
  <div class="commande-view">
    <!-- ... le reste du template ... -->
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CommandeVue",
  data() {
    return {
      salles: [],
      salleSelectionnee: null,
      tables: [],
      tableSelectionnee: null,
      carteMenu: [],
      commande: [],
      searchQuery: "",
      error: null,
      loading: false,
      ws: null
    };
  },
  computed: {
    selectedSalle() {
      return this.salles.find((salle) => salle.id === this.salleSelectionnee) || {};
    },
    selectedTable() {
      return this.tables.find((table) => table.id === this.tableSelectionnee) || {};
    },
    filteredMenu() {
      const query = this.searchQuery.toLowerCase();
      return this.carteMenu.filter(article =>
        article.designation.toLowerCase().includes(query)
      );
    },
  },
  mounted() {
    this.chargerSalles();
    this.connectWebSocket();
  },
  methods: {
    // ... autres méthodes inchangées ...

    async validerCommande() {
      if (!this.tableSelectionnee || this.commande.length === 0) {
        this.error = "Veuillez sélectionner une table et ajouter des articles à la commande.";
        return;
      }

      try {
        this.loading = true;
        
        // Générer une référence unique
        const date = new Date();
        const timestamp = date.getTime();
        const random = Math.floor(Math.random() * 1000);
        const reference = `CMD${timestamp}${random}`;

        console.log('Envoi du ticket...', {
          reference,
          table_id: this.tableSelectionnee,
          etat: "En attente de validation"
        });

        const ticketResponse = await axios.post("http://localhost:5000/api/tickets", {
          reference,
          table_id: this.tableSelectionnee,
          etat: "En attente de validation"
        });

        console.log('Réponse ticket:', ticketResponse.data);

        if (!ticketResponse.data.success) {
          throw new Error(ticketResponse.data.error || "Erreur lors de la création du ticket");
        }

        const ticketId = ticketResponse.data.data.ticket_id;

        console.log('Envoi de la commande...', {
          ticket_id: ticketId,
          items: this.commande.map(item => ({
            article_id: item.id,
            quantite: item.quantite,
            prix: item.prix
          }))
        });

        const commandeResponse = await axios.post("http://localhost:5000/api/commandes", {
          ticket_id: ticketId,
          items: this.commande.map(item => ({
            article_id: item.id,
            quantite: item.quantite,
            prix: item.prix
          }))
        });

        console.log('Réponse commande:', commandeResponse.data);

        if (!commandeResponse.data.success) {
          throw new Error(commandeResponse.data.error || "Erreur lors de l'enregistrement de la commande");
        }

        alert("Commande envoyée à la caisse avec succès !");
        this.commande = [];
        this.tableSelectionnee = null;
        this.error = null;

      } catch (error) {
        this.error = error.response?.data?.error || error.message || "Erreur lors de l'envoi de la commande";
        console.error("Erreur détaillée:", error.response || error);
      } finally {
        this.loading = false;
      }
    },

    // ... autres méthodes inchangées ...
  },
};
</script>

<style scoped>
/* Les styles restent inchangés */
</style>
