<template>
  <div class="card p-4 mt-4">
    <h4>Ajouter un Article à la Carte Menu</h4>
    <form @submit.prevent="validerFormulaire">
      <div class="mb-2">
        <label>Type d'article :</label>
        <select v-model="typeSelectionne" class="form-control" @change="chargerArticles">
          <option value="plat">Plat</option>
          <option value="boisson">Boisson</option>
        </select>
      </div>
      <div class="mb-2">
        <label>Article :</label>
        <select v-model="articleSelectionne" class="form-control" @change="mettreAJourDesignation">
          <option v-for="article in articlesFiltrés" :key="article.id" :value="article">
            {{ article.designation }}
          </option>
        </select>
      </div>
      <div class="mb-2">
        <label>Prix :</label>
        <input type="number" v-model="prix" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Visible :</label>
        <input type="checkbox" v-model="visible">
      </div>

      <div class="d-flex justify-content-between mt-3">
        <button type="submit" class="btn btn-success">Ajouter</button>
        <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Annuler</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FormulairecMenu",
  props: ["salleSelectionnee"],
  data() {
    return {
      typeSelectionne: "plat",
      articles: [],
      articleSelectionne: null,
      prix: 0,
      visible: true,
    };
  },
  computed: {
    articlesFiltrés() {
      return this.articles.filter(article => article.type === this.typeSelectionne);
    }
  },
  mounted() {
    this.chargerArticles();
  },
  methods: {
    async chargerArticles() {
      try {
        const response = await axios.get("http://localhost:5000/api/articles");
        this.articles = response.data;
      } catch (error) {
        console.error("Erreur de chargement des articles:", error);
      }
    },
    mettreAJourDesignation() {
      if (this.articleSelectionne) {
        this.designation = this.articleSelectionne.designation;
        this.imageUrl = this.articleSelectionne.image_url;
      } else {
        this.designation = "";
        this.imageUrl = "";
      }
    },
    async validerFormulaire() {
      if (!this.articleSelectionne || !this.salleSelectionnee) {
        alert("Veuillez sélectionner un article et une salle !");
        return;
      }

      try {
        await axios.post("http://localhost:5000/api/cartemenu", {
          salle_id: this.salleSelectionnee,
          article_id: this.articleSelectionne.id,
          type: this.typeSelectionne,
          prix: this.prix,
          visible: this.visible,
        });
        this.$emit("ajouter");
      } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
      }
    },
  },
};
</script>

<style scoped>
.card {
  max-width: 500px;
  margin: auto;
}
.form-control {
  border-radius: 5px;
}
.btn {
  width: 48%;
}
</style>
