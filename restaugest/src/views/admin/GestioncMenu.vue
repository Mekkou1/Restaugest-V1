<template>
  <div class="gestion-carte-menu container mt-4">
    <h2>Gestion des Cartes Menu</h2>

    <!-- Sélection de la salle -->
    <div class="mb-3">
      <label for="salle">Sélectionnez une salle :</label>
      <select v-model="salleSelectionnee" class="form-select" @change="chargerCarteMenu">
        <option disabled value="">-- Choisissez une salle --</option>
        <option v-for="salle in salles" :key="salle.id" :value="salle.id">{{ salle.nom }}</option>
      </select>
    </div>

    <!-- Tableau des articles de la carte menu -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Type</th>
            <th>Image</th>
            <th>Désignation</th>
            <th>Prix</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in carteMenu" :key="article.id">
            <td>{{ article.type }}</td>
            <td>
              <img :src="article.image_url" alt="image" v-if="article.image_url" width="50">
            </td>
            <td>{{ article.designation }}</td>
            <td>{{ article.prix }} FCFA</td>
            <td>
              <input type="checkbox" v-model="article.visible" @change="modifierVisibilite(article)">
            </td>
            <td>
              <button class="btn btn-warning btn-sm" @click="modifierArticle(article)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="supprimerArticle(article.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulaire d'ajout -->
    <button class="btn btn-primary mt-3" @click="afficherFormulaire = true">+ Ajouter un Article</button>
    <FormulairecMenu v-if="afficherFormulaire"
      @fermer="afficherFormulaire = false"
      @ajouter="ajouterArticle"
      :salleSelectionnee="salleSelectionnee"
    />
  </div>
</template>

<script>
import axios from "axios";
import FormulairecMenu from "@/views/admin/FormulairecMenu.vue";

export default {
  name: "GestioncMenu",
  components: { FormulairecMenu },
  data() {
    return {
      salles: [],
      salleSelectionnee: null,
      carteMenu: [],
      afficherFormulaire: false,
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
        console.error("Erreur de chargement des salles:", error);
      }
    },
    async chargerCarteMenu() {
      if (!this.salleSelectionnee) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/cartemenu/${this.salleSelectionnee}`);
        this.carteMenu = response.data;
      } catch (error) {
        console.error("Erreur de chargement de la carte menu:", error);
      }
    },
    async modifierVisibilite(article) {
      try {
        await axios.put(`http://localhost:5000/api/cartemenu/${article.id}`, {
          prix: article.prix,
          visible: article.visible
        });
        this.chargerCarteMenu();
      } catch (error) {
        console.error("Erreur de modification:", error);
      }
    },
    async supprimerArticle(id) {
      if (confirm("Voulez-vous vraiment supprimer cet article de la carte menu ?")) {
        try {
          await axios.delete(`http://localhost:5000/api/cartemenu/${id}`);
          this.chargerCarteMenu();
        } catch (error) {
          console.error("Erreur de suppression:", error);
        }
      }
    },
    ajouterArticle() {
      this.chargerCarteMenu();
      this.afficherFormulaire = false;
    },
  },
};
</script>

<style scoped>
.gestion-carte-menu {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
.table-responsive {
  overflow-x: auto;
}
.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}
</style>
