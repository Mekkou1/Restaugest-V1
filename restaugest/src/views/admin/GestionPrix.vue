<template>
  <div class="gestion-prix container mt-4">
    <h2 class="text-center">Gestion des Prix par Salle</h2>

    <!-- Sélection de la salle -->
    <div class="mb-3">
      <label for="salle" class="form-label">Sélectionnez une salle :</label>
      <select v-model="salleSelectionnee" @change="chargerPrix" class="form-select">
        <option disabled value="">-- Choisissez une salle --</option>
        <option v-for="salle in salles" :key="salle.id" :value="salle.id">
          {{ salle.nom }} ({{ salle.type }})
        </option>
      </select>
    </div>

    <!-- Tableau des prix -->
    <div v-if="salleSelectionnee">
      <h3>Prix des articles pour {{ salleNom }}</h3>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Article</th>
              <th>Prix Actuel (FCFA)</th>
              <th>Nouveau Prix</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id">
              <td>{{ article.designation }}</td>
              <td>{{ article.prix }}</td>
              <td><input type="number" v-model="article.nouveauPrix" class="form-control" /></td>
              <td>
                <button class="btn btn-success btn-sm" @click="modifierPrix(article)">💾 Enregistrer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "GestionPrix",
  data() {
    return {
      salles: [],
      salleSelectionnee: "",
      articles: [],
      salleNom: "",
    };
  },
  mounted() {
    this.chargerSalles();
  },
  methods: {
    async chargerSalles() {
      try {
        const response = await axios.get("http://localhost:5000/api/salles");
        this.salles = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des salles :", error);
      }
    },
    async chargerPrix() {
      if (!this.salleSelectionnee) return;
      this.salleNom = this.salles.find(salle => salle.id === this.salleSelectionnee)?.nom || "";

      try {
        const response = await axios.get(`http://localhost:5000/api/articles/${this.salleSelectionnee}`);
        this.articles = response.data.map(article => ({ ...article, nouveauPrix: article.prix }));
      } catch (error) {
        console.error("Erreur lors du chargement des prix :", error);
      }
    },
    async modifierPrix(article) {
      try {
        await axios.put(`http://localhost:5000/api/cartes_menu/${this.salleSelectionnee}/${article.id}`, {
          prix: article.nouveauPrix
        });
        alert("Prix mis à jour !");
        this.chargerPrix();
      } catch (error) {
        console.error("Erreur lors de la mise à jour du prix :", error);
      }
    }
  }
};
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>
