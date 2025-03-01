<template>
  <div class="gestion-salles container mt-4">
    <div v-if="!afficherFormulaire" class="header-bar d-flex justify-content-between align-items-center flex-wrap mb-4">
      <h2 class="mb-3">Gestion des Salles</h2>
      <button class="btn btn-primary" @click="afficherFormulaire = true">+ Nouvelle Salle</button>
    </div>

    <!-- Liste des Salles -->
    <div v-if="!afficherFormulaire" class="table-responsive mb-4">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Référence</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(salle, index) in salles" :key="index">
            <td>{{ salle.ref }}</td>
            <td>{{ salle.nom }}</td>
            <td>{{ salle.type }}</td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="modifierSalle(index)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="supprimerSalle(index)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulaire d'ajout/modification de Salle -->
    <FormSalle v-if="afficherFormulaire" @fermer="afficherFormulaire = false" @ajouter="ajouterSalle" @modifier="modifierSalle" :salle="salleEnCours" />
  </div>
</template>

<script>
import FormSalle from './FormSalle.vue';
import { sallesAPI } from '../../utils/api';

export default {
  name: "GestionSalles",
  components: { FormSalle },
  data() {
    return {
      salles: [],
      afficherFormulaire: false,
      salleEnCours: {},
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      }
    };
  },
  methods: {
    async fetchSalles() {
      this.loading = true;
      this.error = null;
      try {
        const response = await sallesAPI.getAll(
          this.pagination.page,
          this.pagination.limit
        );
        this.salles = response.data.data;
        this.pagination.total = response.data.pagination.total;
      } catch (error) {
        console.error('Erreur lors de la récupération des salles:', error);
        this.error = 'Erreur lors du chargement des salles. Veuillez réessayer.';
        this.$toast.error('Erreur lors du chargement des salles');
      } finally {
        this.loading = false;
      }
    },

    async modifierSalle(index) {
      this.salleEnCours = { ...this.salles[index] };
      this.afficherFormulaire = true;
    },

    async supprimerSalle(index) {
      if (confirm("Voulez-vous vraiment supprimer cette salle ?")) {
        try {
          await sallesAPI.delete(this.salles[index].id);
          this.salles.splice(index, 1);
          this.$toast.success('Salle supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression de la salle:', error);
          this.$toast.error('Erreur lors de la suppression de la salle');
        }
      }
    },

    async ajouterSalle(salle) {
      try {
        const response = await sallesAPI.create(salle);
        this.salles.push(response.data);
        this.afficherFormulaire = false;
        this.salleEnCours = {};
        this.$toast.success('Salle ajoutée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la salle:', error);
        this.$toast.error('Erreur lors de l\'ajout de la salle');
      }
    }
  },
  created() {
    this.fetchSalles();
  }
};
</script>

<style scoped>
.gestion-salles {
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

.badge {
  font-size: 14px;
}
</style>
