<template>
  <div class="gestion-intrants container mt-4">
    <!-- En-tête -->
    <div class="header-bar d-flex justify-content-between align-items-center flex-wrap mb-4">
      <h2 class="mb-3">Gestion des Intrants</h2>
      <button class="btn btn-primary" @click="afficherFormulaire = true">+ Ajouter un intrant</button>
    </div>

    <!-- Tableau des intrants -->
    <div class="table-responsive mt-3" v-if="intrants.length">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Nomenclature</th>
            <th>Famille</th>
            <th>Stock</th>
            <th>Seuil d'alerte</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="intrant in intrants" :key="intrant.id">
            <td>{{ intrant.ref }}</td>
            <td>{{ intrant.designation }}</td>
            <td>{{ intrant.nomenclature }}</td>
            <td>{{ intrant.famille }}</td>
            <td>{{ intrant.stock }}</td>
            <td>{{ intrant.seuil_alerte }}</td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="modifierIntrant(intrant)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="supprimerIntrant(intrant.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-center mt-3">Aucun intrant disponible.</p>

    <!-- Formulaire d'ajout/modification d'intrant -->
    <FormulaireIntrant
      v-if="afficherFormulaire"
      :intrant="intrantSelectionne"
      @fermer="afficherFormulaire = false; intrantSelectionne = null"
      @ajouter="ajouterIntrant"
    />
  </div>
</template>

<script>
import axios from "axios";
import FormulaireIntrant from "@/views/admin/FormulaireIntrant.vue";

export default {
  name: "GestionIntrants",
  components: { FormulaireIntrant },
  data() {
    return {
      intrants: [],
      afficherFormulaire: false,
      intrantSelectionne: null,
    };
  },
  mounted() {
    this.chargerIntrants();
  },
  methods: {
    async chargerIntrants() {
      try {
        const response = await axios.get("http://localhost:5000/api/intrants");
        this.intrants = response.data;
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    },
    ajouterIntrant(nouvelIntrant) {
      this.intrants.push(nouvelIntrant);
      this.afficherFormulaire = false;
      this.intrantSelectionne = null;
    },
    modifierIntrant(intrant) {
      this.intrantSelectionne = { ...intrant };
      this.afficherFormulaire = true;
    },
    async supprimerIntrant(id) {
      if (confirm("Voulez-vous vraiment supprimer cet intrant ?")) {
        try {
          await axios.delete(`http://localhost:5000/api/intrants/${id}`);
          this.intrants = this.intrants.filter(intrant => intrant.id !== id);
        } catch (error) {
          console.error("Erreur de suppression :", error);
        }
      }
    }
  }
};
</script>

<style scoped>
.gestion-intrants {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
</style>
