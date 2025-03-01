<template>
    <div class="gestion-familles container mt-4">
      <div class="header-bar d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 class="mb-3">Gestion des Familles d'Articles</h2>
        <button class="btn btn-primary" @click="afficherFormulaire = true">+ Nouvelle Famille</button>
      </div>
  
      <!-- Liste des Familles d'Articles -->
      <div v-if="!afficherFormulaire" class="table-responsive mb-4">
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(famille, index) in familles" :key="index">
              <td>{{ famille.nom }}</td>
              <td>{{ famille.description }}</td>
              <td>
                <button class="btn btn-warning btn-sm me-2" @click="modifierFamille(index)">✏️</button>
                <button class="btn btn-danger btn-sm" @click="supprimerFamille(index)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Formulaire d'ajout/modification de Famille d'Article -->
      <FormulaireFamille v-if="afficherFormulaire" @fermer="afficherFormulaire = false" @ajouter="ajouterFamille" @modifier="modifierFamille" :famille="familleEnCours" />
    </div>
  </template>
  
  <script>
  import FormulaireFamille from '@/views/admin/FormulaireFamille.vue';
  import axios from 'axios';
  
  export default {
    name: "GestionFamilles",
    components: { FormulaireFamille },
    data() {
      return {
        familles: [],
        afficherFormulaire: false,
        familleEnCours: {},
      };
    },
    methods: {
      async fetchFamilles() {
        try {
          const response = await axios.get('http://localhost:5000/api/familles');
          this.familles = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération des familles:', error);
        }
      },
      modifierFamille(index) {
        this.familleEnCours = { ...this.familles[index] };
        this.afficherFormulaire = true;
      },
      supprimerFamille(index) {
        if (confirm("Voulez-vous vraiment supprimer cette famille d'article ?")) {
          axios.delete(`http://localhost:5000/api/familles/${this.familles[index].id}`)
            .then(() => {
              this.familles.splice(index, 1);
            })
            .catch(error => {
              console.error('Erreur lors de la suppression de la famille:', error);
            });
        }
      },
      ajouterFamille(famille) {
        this.familles.push(famille);
        this.afficherFormulaire = false;
        this.familleEnCours = {};
      },
    },
    created() {
      this.fetchFamilles();
    },
  };
  </script>
  
  <style scoped>
  .gestion-familles {
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
  
  .btn-sm {
    padding: 5px 10px;
  }
  </style>
  