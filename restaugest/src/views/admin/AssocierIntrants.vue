<template>
    <div class="associer-intrants container mt-4">
      <div class="header-bar d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 class="mb-3">Associer des Intrants aux Plats/Boissons</h2>
        <select v-model="selectedArticleType" class="form-select" @change="fetchArticles">
          <option value="plat">Plats</option>
          <option value="boisson">Boissons</option>
        </select>
      </div>
  
      <div class="table-responsive mb-4">
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Référence</th>
              <th>Désignation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id">
              <td>{{ article.ref }}</td>
              <td>{{ article.designation }}</td>
              <td>
                <button class="btn btn-success btn-sm" @click="associerIntrants(article)">Associer Intrants</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div v-if="selectedArticle" class="mt-4">
        <h3>Intrants pour {{ selectedArticle.designation }}</h3>
        <div class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(intrant, index) in intrants" :key="index">
                <td>{{ intrant.ref }}</td>
                <td>{{ intrant.designation }}</td>
                <td>
                  <input type="number" v-model="intrant.quantite" class="form-control" required>
                </td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="supprimerIntrant(index)">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-3">
          <h4>Ajouter des Intrants</h4>
          <select v-model="selectedIntrant" class="form-select">
            <option v-for="intrant in availableIntrants" :key="intrant.id" :value="intrant">
              {{ intrant.designation }}
            </option>
          </select>
          <button class="btn btn-success mt-2" @click="ajouterIntrant">Ajouter Intrant</button>
        </div>
        <button class="btn btn-primary mt-3" @click="sauvegarderAssociations">Sauvegarder</button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: "AssocierIntrants",
    data() {
      return {
        selectedArticleType: 'plat',
        articles: [],
        selectedArticle: null,
        intrants: [],
        availableIntrants: [],
        selectedIntrant: null,
      };
    },
    methods: {
      async fetchArticles() {
        try {
          const response = await axios.get(`http://localhost:5000/api/${this.selectedArticleType}s`);
          this.articles = response.data;
        } catch (error) {
          console.error(`Erreur de chargement des ${this.selectedArticleType}s:`, error);
        }
      },
      async fetchIntrants() {
        try {
          const response = await axios.get('http://localhost:5000/api/intrants');
          this.availableIntrants = response.data;
        } catch (error) {
          console.error('Erreur de chargement des intrants:', error);
        }
      },
      associerIntrants(article) {
        this.selectedArticle = article;
        this.fetchIntrants();
      },
      ajouterIntrant() {
        if (this.selectedIntrant) {
          const existingIntrant = this.intrants.find(intrant => intrant.id === this.selectedIntrant.id);
          if (!existingIntrant) {
            this.intrants.push({ ...this.selectedIntrant, quantite: 0 });
          }
        }
      },
      supprimerIntrant(index) {
        this.intrants.splice(index, 1);
      },
      async sauvegarderAssociations() {
        try {
          const associations = this.intrants.map(intrant => ({
            article_id: this.selectedArticle.id,
            intrant_id: intrant.id,
            quantite: intrant.quantite,
          }));
  
          await axios.post('http://localhost:5000/api/associations', associations);
          alert('Associations sauvegardées avec succès !');
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des associations:', error);
        }
      },
    },
    created() {
      this.fetchArticles();
    },
  };
  </script>
  
  <style scoped>
  .associer-intrants {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  </style>
  