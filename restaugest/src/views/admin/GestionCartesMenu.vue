<template>
    <div class="gestion-cartes-menu container mt-4">
      <h2 class="text-center">Gestion des Cartes Menu</h2>
  
      <!-- Sélection de la salle -->
      <div class="mb-3">
        <label for="salle" class="form-label">Sélectionnez une salle :</label>
        <select v-model="salleSelectionnee" @change="chargerCarteMenu" class="form-select">
          <option disabled value="">-- Choisissez une salle --</option>
          <option v-for="salle in salles" :key="salle.id" :value="salle.id">
            {{ salle.nom }} ({{ salle.type }})
          </option>
        </select>
      </div>
  
      <!-- Affichage du menu -->
      <div v-if="salleSelectionnee" class="menu-container">
        <h3>Carte de la salle : {{ salleNom }}</h3>
        <div v-if="menu.length === 0" class="text-center text-muted">Aucun article dans cette carte menu.</div>
  
        <div class="row">
          <div v-for="item in menu" :key="item.id" class="col-md-4 mb-3">
            <div class="card">
              <img v-if="item.photo_url" :src="item.photo_url" class="card-img-top" alt="Image article">
              <div class="card-body">
                <h5 class="card-title">{{ item.designation }}</h5>
                <p class="card-text">Prix : {{ item.prix }} FCFA</p>
                <p class="card-text"><strong>Type :</strong> {{ item.type }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "GestionCartesMenu",
    data() {
      return {
        salles: [],
        salleSelectionnee: "",
        menu: [],
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
      async chargerCarteMenu() {
        if (!this.salleSelectionnee) return;
        this.salleNom = this.salles.find(salle => salle.id === this.salleSelectionnee)?.nom || "";
  
        try {
          const response = await axios.get(`http://localhost:5000/api/cartemenu/${this.salleSelectionnee}`);
          this.menu = response.data;
        } catch (error) {
          console.error("Erreur lors du chargement de la carte menu :", error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .gestion-cartes-menu {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }
  
  .menu-container {
    margin-top: 20px;
  }
  
  .card-img-top {
    height: 150px;
    object-fit: cover;
  }
  </style>
  