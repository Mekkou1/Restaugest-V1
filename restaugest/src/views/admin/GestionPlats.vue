<template>
    <div class="gestion-plats container mt-4">
      <div v-if="!afficherFormulaire">
        <div class="header-bar d-flex justify-content-between align-items-center flex-wrap">
          <h2 class="mb-3">Gestion des Plats</h2>
          <button class="btn btn-primary" @click="ouvrirFormulaire(null)">+ Nouveau Plat</button>
        </div>
  
        <!-- Tableau des plats -->
        <div class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>Image</th>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Famille</th>
                <th>Prix (FCFA)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plat in plats" :key="plat.id">
                <td>
                  <img :src="getImageUrl(plat.image_url)" alt="Image plat" class="plat-image">
                </td>
                <td>{{ plat.ref }}</td>
                <td>{{ plat.designation }}</td>
                <td>{{ plat.famille_nom }}</td>
                <td>{{ plat.prix }}</td>
                <td>
                  <button class="btn btn-warning btn-sm me-2" @click="ouvrirFormulaire(plat)">✏️</button>
                  <button class="btn btn-danger btn-sm" @click="supprimerPlat(plat.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Formulaire d'ajout/modification -->
      <FormulairePlat v-if="afficherFormulaire" :plat="platSelectionne" @fermer="afficherFormulaire = false" @majListe="chargerPlats" />
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import FormulairePlat from "@/views/admin/FormulairePlat.vue";
  
  export default {
    name: "GestionPlats",
    components: { FormulairePlat },
    data() {
      return {
        plats: [],
        afficherFormulaire: false,
        platSelectionne: null,
      };
    },
    mounted() {
      this.chargerPlats();
    },
    methods: {
      async chargerPlats() {
        try {
          const response = await axios.get("http://localhost:5000/api/plats");
          this.plats = response.data;
        } catch (error) {
          console.error("Erreur de chargement des plats:", error);
        }
      },
      async supprimerPlat(id) {
        if (confirm("Voulez-vous vraiment supprimer ce plat ?")) {
          try {
            await axios.delete(`http://localhost:5000/api/plats/${id}`);
            this.chargerPlats();
          } catch (error) {
            console.error("Erreur de suppression:", error);
          }
        }
      },
      ouvrirFormulaire(plat) {
        this.platSelectionne = plat;
        this.afficherFormulaire = true;
      },
      getImageUrl(imagePath) {
        return imagePath ? `http://localhost:5000/${imagePath}` : "/default-plat.png";
      }
    },
  };
  </script>
  
  <style scoped>
  .gestion-plats {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .plat-image {
    width: 50px;
    height: 50px;
    border-radius: 5px;
  }
  </style>
  