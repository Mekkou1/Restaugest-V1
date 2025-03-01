<template>
    <div class="approvisionnement-stock container mt-4">
      <h2 class="text-center">Approvisionnement des Stocks</h2>
  
      <!-- Sélection du type d'article -->
      <div class="mb-3">
        <label for="type" class="form-label">Type d'article :</label>
        <select v-model="typeSelectionne" @change="chargerArticles" class="form-select">
          <option disabled value="">-- Choisissez un type --</option>
          <option value="Intrant">Intrants</option>
          <option value="Boisson">Boissons</option>
        </select>
      </div>
  
      <!-- Formulaire d'approvisionnement -->
      <div v-if="typeSelectionne">
        <h3>Ajouter du stock</h3>
        <div class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>Article</th>
                <th>Stock Actuel</th>
                <th>Quantité Ajoutée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in articles" :key="article.id">
                <td>{{ article.designation }}</td>
                <td>{{ article.stock }}</td>
                <td><input type="number" v-model="article.quantiteAjoutee" class="form-control" /></td>
                <td>
                  <button class="btn btn-success btn-sm" @click="approvisionnerStock(article)">✅ Ajouter</button>
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
    name: "ApprovisionnementStock",
    data() {
      return {
        typeSelectionne: "",
        articles: [],
      };
    },
    methods: {
      async chargerArticles() {
        if (!this.typeSelectionne) return;
        try {
          const response = await axios.get(`http://localhost:5000/api/stock/${this.typeSelectionne}`);
          this.articles = response.data.map(article => ({ ...article, quantiteAjoutee: 0 }));
        } catch (error) {
          console.error("Erreur lors du chargement des stocks :", error);
        }
      },
      async approvisionnerStock(article) {
        try {
          await axios.put(`http://localhost:5000/api/stock/${article.id}`, {
            quantite: article.quantiteAjoutee
          });
          alert("Stock mis à jour !");
          this.chargerArticles();
        } catch (error) {
          console.error("Erreur lors de l'approvisionnement :", error);
        }
      }
    }
  };
  </script>
  