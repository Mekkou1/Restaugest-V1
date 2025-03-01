<template>
  <div class="gestion-boissons container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Gestion des Boissons</h2>
      <button class="btn btn-primary" @click="afficherFormulaire = true">+ Nouvelle Boisson</button>
    </div>

    <!-- Tableau des boissons -->
    <div class="table-responsive mt-3">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Famille</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="boisson in boissons" :key="boisson.id">
            <td>{{ boisson.ref }}</td>
            <td>{{ boisson.designation }}</td>
            <td>{{ boisson.famille_id }}</td>
            <td>{{ boisson.prix }} FCFA</td>
            <td>{{ boisson.stock }}</td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="modifierBoisson(boisson)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="supprimerBoisson(boisson.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulaire d'ajout/modification -->
    <FormulaireBoisson v-if="afficherFormulaire" @fermer="afficherFormulaire = false" @sauvegarder="ajouterBoisson" />
  </div>
</template>

<script>
import axios from "axios";
import FormulaireBoisson from "@/views/admin/FormulaireBoisson.vue";

export default {
  name: "GestionBoissons",
  components: { FormulaireBoisson },
  data() {
    return {
      boissons: [],
      afficherFormulaire: false,
    };
  },
  mounted() {
    this.chargerBoissons();
  },
  methods: {
    async chargerBoissons() {
      try {
        const response = await axios.get("http://localhost:5000/api/boissons");
        this.boissons = response.data;
      } catch (error) {
        console.error("Erreur de chargement des boissons:", error);
      }
    },
    async ajouterBoisson(boisson) {
      try {
        await axios.post("http://localhost:5000/api/boissons", boisson);
        this.chargerBoissons();
        this.afficherFormulaire = false;
      } catch (error) {
        console.error("Erreur d'ajout de la boisson:", error);
      }
    },
    async supprimerBoisson(id) {
      if (confirm("Voulez-vous vraiment supprimer cette boisson ?")) {
        try {
          await axios.delete(`http://localhost:5000/api/boissons/${id}`);
          this.chargerBoissons();
        } catch (error) {
          console.error("Erreur de suppression de la boisson:", error);
        }
      }
    },
  },
};
</script>



<style scoped>
.gestion-boissons {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.img-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
}
</style>
