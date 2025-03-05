<template>
    <div class="gestion-carte-menu container mt-4">
      <div class="card">
        <div class="card-header">
          <h2>Gestion des Cartes Menu par Salle</h2>
        </div>
        <div class="card-body">
          <!-- Sélection de la salle -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="form-label">Sélectionner une salle :</label>
              <select v-model="salleSelectionnee" class="form-select" @change="onSalleChange">
                <option value="">Choisir une salle...</option>
                <option v-for="salle in salles" :key="salle.id" :value="salle.id">
                  {{ salle.nom }} ({{ salle.type }})
                </option>
              </select>
            </div>
            <div class="col-md-6 d-flex align-items-end" v-if="salleSelectionnee">
              <button class="btn btn-primary" @click="afficherFormulaireAjout">
                <i class="fas fa-plus"></i> Ajouter un article
              </button>
            </div>
          </div>
  
          <!-- Filtres -->
          <div v-if="salleSelectionnee" class="row mb-3">
            <div class="col">
              <div class="btn-group">
                <button 
                  v-for="type in ['Tous', 'Plat', 'Boisson']" 
                  :key="type"
                  class="btn"
                  :class="typeFiltre === type ? 'btn-primary' : 'btn-outline-primary'"
                  @click="typeFiltre = type"
                >
                  {{ type }}
                </button>
              </div>
            </div>
          </div>
  
          <!-- Table des articles -->
          <div v-if="salleSelectionnee">
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
  
            <div v-else-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
  
            <div v-else class="table-responsive">
              <table class="table table-striped">
                <thead class="table-dark">
                  <tr>
                    <th>Type</th>
                    <th>Désignation</th>
                    <th>Prix</th>
                    <th>Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="article in articlesFiltres" :key="article.id">
                    <td>{{ article.type }}</td>
                    <td>{{ article.designation }}</td>
                    <td>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control form-control-sm" 
                          v-model.number="article.prix"
                          @change="updatePrice(article)"
                        >
                        <span class="input-group-text">FCFA</span>
                      </div>
                    </td>
                    <td>
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          v-model="article.visible"
                          @change="toggleVisibility(article)"
                        >
                      </div>
                    </td>
                    <td>
                      <button 
                        class="btn btn-danger btn-sm" 
                        @click="supprimerArticle(article)"
                        title="Supprimer"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <div v-else class="text-center p-5">
            <i class="fas fa-arrow-up fa-2x mb-3"></i>
            <p>Veuillez sélectionner une salle pour gérer sa carte menu</p>
          </div>
        </div>
      </div>
  
      <!-- Modal d'ajout -->
      <div class="modal" tabindex="-1" :class="{ 'd-block': afficherFormulaire }">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Ajouter un article à la carte</h5>
              <button type="button" class="btn-close" @click="fermerFormulaire"></button>
            </div>
            <div class="modal-body">
              <FormulairecMenu 
                :salleSelectionnee="salleSelectionnee"
                @ajouter="articleAjoute"
                @fermer="fermerFormulaire"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" v-if="afficherFormulaire"></div>
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import FormulairecMenu from './FormulairecMenu.vue';
  import api from '../../utils/api';
  
  export default {
    name: 'GestionCarteMenu',
    components: {
      FormulairecMenu
    },
    data() {
      return {
        salles: [],
        salleSelectionnee: '',
        typeFiltre: 'Tous',
        afficherFormulaire: false
      };
    },
    computed: {
      ...mapState('menu', ['loading', 'error']),
      ...mapGetters('menu', ['getCarteMenu']),
      
      articlesFiltres() {
        if (this.typeFiltre === 'Tous') {
          return this.getCarteMenu;
        }
        return this.getCarteMenu.filter(
          article => article.type.toLowerCase() === this.typeFiltre.toLowerCase()
        );
      }
    },
    methods: {
      ...mapActions('menu', [
        'fetchCarteMenu',
        'addMenuItem',
        'updateMenuItem',
        'removeMenuItem',
        'toggleItemVisibility'
      ]),
  
      async chargerSalles() {
        try {
          const response = await api.get('/salles');
          this.salles = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement des salles:', error);
        }
      },
  
      async onSalleChange() {
        if (this.salleSelectionnee) {
          await this.fetchCarteMenu(this.salleSelectionnee);
        }
      },
  
      async updatePrice(article) {
        await this.updateMenuItem({
          salleId: this.salleSelectionnee,
          itemId: article.id,
          updates: { prix: article.prix }
        });
      },
  
      async toggleVisibility(article) {
        await this.toggleItemVisibility({
          salleId: this.salleSelectionnee,
          itemId: article.id,
          visible: article.visible
        });
      },
  
      async supprimerArticle(article) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article de la carte ?')) {
          await this.removeMenuItem({
            salleId: this.salleSelectionnee,
            itemId: article.id
          });
        }
      },
  
      afficherFormulaireAjout() {
        this.afficherFormulaire = true;
      },
  
      fermerFormulaire() {
        this.afficherFormulaire = false;
      },
  
      async articleAjoute() {
        this.fermerFormulaire();
        await this.fetchCarteMenu(this.salleSelectionnee);
      }
    },
    mounted() {
      this.chargerSalles();
    }
  };
  </script>
  
  <style scoped>
  .gestion-carte-menu {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .modal {
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .form-switch {
    display: flex;
    justify-content: center;
  }
  
  .input-group {
    width: 200px;
  }
  
  .btn-group {
    gap: 5px;
  }
  
  .btn-group .btn {
    border-radius: 5px;
  }
  
  .table th, .table td {
    vertical-align: middle;
  }
  
  .spinner-border {
    width: 3rem;
    height: 3rem;
  }
  </style>
  