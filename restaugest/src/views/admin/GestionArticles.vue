<template>
  <div class="gestion-articles container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Gestion des Articles</h2>
      <button class="btn btn-primary" @click="ajouterNouveauArticle">+ Nouvel Article</button>
    </div>

    <!-- Tableau des articles -->
    <div class="table-responsive mt-3">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Type</th>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Famille</th>
            <th>Prix/Stock</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.type }}</td>
            <td>{{ article.ref }}</td>
            <td>{{ article.designation }}</td>
            <td>{{ article.famille }}</td>
            <td>{{ article.prix }} FCFA</td>
            <td>
              <img v-if="article.image_url" :src="article.image_url" alt="Article" class="article-img">
              <span v-else>Pas d'image</span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="modifierArticle(article)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="supprimerArticle(article)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulaire d'ajout/modification d'article -->
    <FormulaireArticle v-if="afficherFormulaire" :article="articleEdite" @fermer="fermerFormulaire" @sauvegarder="sauvegarderArticle" />
  </div>
</template>

<script>
import axios from "axios";
import FormulaireArticle from "@/views/admin/FormulaireArticle.vue";

export default {
  name: "GestionArticles",
  components: { FormulaireArticle },
  data() {
    return {
      articles: [],
      afficherFormulaire: false,
      articleEdite: null, // Garde une copie de l'article à modifier
    };
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
    ajouterNouveauArticle() {
      this.articleEdite = null; // Réinitialise pour ajouter un nouveau
      this.afficherFormulaire = true;
    },
    sauvegarderArticle(article) {
      if (article.id) {
        // Mise à jour d'un article existant
        const index = this.articles.findIndex(a => a.id === article.id);
        if (index !== -1) {
          this.articles[index] = article;
        }
      } else {
        // Ajout d'un nouvel article
        this.articles.push(article);
      }
      this.fermerFormulaire();
    },
    modifierArticle(article) {
      this.articleEdite = { ...article }; // Cloner l'article pour modification
      this.afficherFormulaire = true;
    },
    async supprimerArticle(article) {
      if (confirm("Voulez-vous vraiment supprimer cet article ?")) {
        try {
          await axios.delete(`http://localhost:5000/api/articles/${article.type}/${article.id}`);
          this.chargerArticles();
        } catch (error) {
          console.error("Erreur de suppression de l'article:", error);
        }
      }
    },
    fermerFormulaire() {
      this.articleEdite = null;
      this.afficherFormulaire = false;
    },
  },
};
</script>

<style scoped>
.gestion-articles {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.article-img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}
</style>
