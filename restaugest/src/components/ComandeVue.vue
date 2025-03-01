<template>
  <div class="commande-view" v-if="!isLoading">
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <h1 class="text-center mb-4">Prise de Commande</h1>

    <!-- Sélection de la salle -->
    <div class="table-selection mb-4">
      <label for="salle" class="form-label">Sélectionnez une salle :</label>
      <select v-model="salleSelectionnee" id="salle" class="form-select" @change="chargerTables">
        <option disabled value="">-- Choisissez une salle --</option>
        <option v-for="salle in salles" :key="salle.id" :value="salle.id">
          {{ salle.nom }}
        </option>
      </select>
    </div>

    <!-- Sélection de la table -->
    <div v-if="salleSelectionnee" class="table-selection mb-4">
      <label for="table" class="form-label">Sélectionnez une table :</label>
      <select v-model="tableSelectionnee" id="table" class="form-select" @change="chargerCarte">
        <option disabled value="">-- Choisissez une table --</option>
        <option v-for="table in tables" :key="table.id" :value="table.id">
          Table {{ table.nom }} ({{ table.type }})
        </option>
      </select>
    </div>

    <!-- Affichage de la carte menu -->
    <div v-if="tableSelectionnee" class="menu-view mb-4">
      <h2>Carte Salle {{ selectedSalle.nom }} pour {{ selectedTable.nom }}</h2>
      <div class="search-bar mb-3">
        <input v-model="searchQuery" class="form-control" placeholder="Rechercher un article..." />
      </div>
      <ul>
        <li v-for="article in filteredMenu" :key="article.id" class="list-group-item d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img :src="`/uploads/${article.image}`" alt="article.designation" class="me-3" style="width: 50px; height: 50px;">
            <span>{{ article.designation }} - {{ article.prix }} FCFA</span>
          </div>
          <button class="btn btn-primary" @click="ajouterALaCommande(article)">Ajouter</button>
        </li>
      </ul>
    </div>

    <!-- Commandes ajoutées -->
    <div v-if="commande.length > 0" class="commande-liste">
      <h2>Commande Table {{ selectedTable.nom }}</h2>
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(item, index) in commande" :key="index">
          <span>{{ item.designation }} - {{ item.prix }} FCFA ({{ item.quantite }}x)</span>
          <div>
            <button class="btn btn-success btn-sm" @click="augmenterQuantite(index)">+</button>
            <button class="btn btn-danger btn-sm" @click="reduireQuantite(index)">-</button>
          </div>
        </li>
      </ul>
      <button class="btn btn-success mt-3" @click="validerCommande">Valider Commande</button>
    </div>
  </div>
  <div v-else class="text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'; // Assurez-vous que ce fichier est correctement configuré

export default {
  name: "CommandeVue",
  data() {
    return {
      salles: [], // Liste des salles
      salleSelectionnee: null, // ID de la salle sélectionnée
      tables: [], // Liste des tables pour la salle sélectionnée
      tableSelectionnee: null, // ID de la table sélectionnée
      carteMenu: [], // Carte menu pour la salle sélectionnée
      commande: [], // Articles ajoutés à la commande
      searchQuery: "", // Terme de recherche pour filtrer la carte menu
      ws: null, // Connexion WebSocket
      isLoading: false, // État de chargement
      error: null, // Message d'erreur
    };
  },
  computed: {
    // Retourne la salle sélectionnée
    selectedSalle() {
      return this.salles.find((salle) => salle.id === this.salleSelectionnee) || {};
    },
    // Retourne la table sélectionnée
    selectedTable() {
      return this.tables.find((table) => table.id === this.tableSelectionnee) || {};
    },
    // Filtre la carte menu en fonction de la recherche
    filteredMenu() {
      const query = this.searchQuery.toLowerCase();
      return this.carteMenu.filter(article =>
        article.designation.toLowerCase().includes(query)
      );
    },
  },
  mounted() {
    this.chargerSalles(); // Charge les salles au montage du composant
    this.connectWebSocket(); // Établit la connexion WebSocket
  },
  methods: {
    // Charge la liste des salles depuis l'API
    async chargerSalles() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/salles'); // Assurez-vous que cette route existe dans votre backend
        this.salles = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des salles:", error);
        this.error = "Erreur lors du chargement des salles. Veuillez réessayer.";
        setTimeout(() => this.chargerSalles(), 5000); // Réessayer après 5 secondes
      } finally {
        this.isLoading = false;
      }
    },

    // Charge les tables pour la salle sélectionnée
    async chargerTables() {
      if (!this.salleSelectionnee) return;
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/salles/${this.salleSelectionnee}/tables`); // Assurez-vous que cette route existe
        this.tables = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des tables:", error);
        this.error = "Erreur lors du chargement des tables. Veuillez réessayer.";
        setTimeout(() => this.chargerTables(), 5000); // Réessayer après 5 secondes
      } finally {
        this.isLoading = false;
      }
    },

    // Charge la carte menu pour la salle sélectionnée
    async chargerCarte() {
      if (!this.salleSelectionnee) return;
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/cartemenu/${this.salleSelectionnee}`); // Assurez-vous que cette route existe
        this.carteMenu = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement de la carte:", error);
        this.error = "Erreur lors du chargement de la carte. Veuillez réessayer.";
        setTimeout(() => this.chargerCarte(), 5000); // Réessayer après 5 secondes
      } finally {
        this.isLoading = false;
      }
    },

    // Ajoute un article à la commande
    ajouterALaCommande(article) {
      const existant = this.commande.find((el) => el.id === article.id);
      if (existant) {
        existant.quantite++;
      } else {
        this.commande.push({ ...article, quantite: 1 });
      }
    },

    // Augmente la quantité d'un article dans la commande
    augmenterQuantite(index) {
      this.commande[index].quantite++;
    },

    // Réduit la quantité d'un article dans la commande
    reduireQuantite(index) {
      if (this.commande[index].quantite > 1) {
        this.commande[index].quantite--;
      } else {
        this.commande.splice(index, 1);
      }
    },

    // Valide la commande
    async validerCommande() {
      if (!this.tableSelectionnee || this.commande.length === 0) {
        alert("Veuillez sélectionner une table et ajouter des articles à la commande.");
        return;
      }

      try {
        // Crée un ticket
        const ticketResponse = await api.post("/tickets", {
          table_id: this.tableSelectionnee,
          etat: "En attente de validation",
        });

        const ticketId = ticketResponse.data.id;

        // Ajoute les articles à la commande
        await api.post("/commandes", {
          ticket_id: ticketId,
          items: this.commande.map((item) => ({
            article_id: item.id,
            quantite: item.quantite,
            prix: item.prix,
          })),
        });

        alert("Commande envoyée à la caisse avec succès !");
        this.commande = []; // Réinitialise la commande
        this.tableSelectionnee = null; // Réinitialise la table sélectionnée
      } catch (error) {
        console.error("Erreur lors de l'envoi de la commande :", error);
        alert("Impossible d'envoyer la commande. Veuillez réessayer.");
      }
    },

    // Établit la connexion WebSocket
    connectWebSocket() {
      this.ws = new WebSocket(process.env.VUE_APP_WS_URL || 'ws://localhost:5000');

      this.ws.onopen = () => {
        console.log("Connected to WebSocket server");
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.message === "Nouvelle commande") {
          alert(`Nouvelle commande reçue avec le ticket ID: ${message.ticket_id}`);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(() => this.connectWebSocket(), 5000); // Réessayer après 5 secondes
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    },
  },
};
</script>

<style scoped>
.commande-view {
  max-width: 800px;
  margin: 0 auto;
}

.table-selection {
  margin-bottom: 20px;
}

.menu-view ul {
  list-style-type: none;
  padding: 0;
}

.menu-view li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.commande-liste ul {
  list-style-type: none;
  padding: 0;
}

.commande-liste li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.alert {
  margin: 20px auto;
  max-width: 600px;
}
</style>