<template>
  <div class="card p-4 mt-4">
    <h4>{{ intrantLocal.id ? 'Modifier' : 'Ajouter' }} un Intrant</h4>
    <form @submit.prevent="validerFormulaire">
      <div class="mb-2">
        <label>Référence :</label>
        <input type="text" v-model="intrantLocal.ref" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Désignation :</label>
        <input type="text" v-model="intrantLocal.designation" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Nomenclature :</label>
        <input type="text" v-model="intrantLocal.nomenclature" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Famille :</label>
        <select v-model="intrantLocal.famille_id" class="form-control" required>
          <option v-for="famille in familles" :key="famille.id" :value="famille.id">{{ famille.nom }}</option>
        </select>
      </div>
      <div class="mb-2">
        <label>Stock :</label>
        <input type="number" v-model="intrantLocal.stock" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Seuil d'alerte :</label>
        <input type="number" v-model="intrantLocal.seuil_alerte" class="form-control" required>
      </div>

      <div class="d-flex justify-content-between mt-3">
        <button type="submit" class="btn btn-success">{{ intrantLocal.id ? 'Modifier' : 'Ajouter' }}</button>
        <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Annuler</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FormulaireIntrant",
  props: {
    intrant: {
      type: Object,
      default: () => ({
        ref: "",
        designation: "",
        nomenclature: "",
        famille_id: "",
        stock: "",
        seuil_alerte: "",
      }),
    },
  },
  data() {
    return {
      intrantLocal: { ...this.intrant },
      familles: [],
    };
  },
  mounted() {
    this.chargerFamilles();
  },
  methods: {
    async chargerFamilles() {
      try {
        const response = await axios.get("http://localhost:5000/api/familles");
        this.familles = response.data;
      } catch (error) {
        console.error("Erreur de chargement des familles :", error);
      }
    },
    async validerFormulaire() {
      try {
        const formData = new FormData();
        formData.append('ref', this.intrantLocal.ref);
        formData.append('designation', this.intrantLocal.designation);
        formData.append('nomenclature', this.intrantLocal.nomenclature);
        formData.append('famille_id', this.intrantLocal.famille_id);
        formData.append('stock', this.intrantLocal.stock);
        formData.append('seuil_alerte', this.intrantLocal.seuil_alerte);

        if (this.intrantLocal.id) {
          await axios.put(`http://localhost:5000/api/intrants/${this.intrantLocal.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          await axios.post("http://localhost:5000/api/intrants", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }

        this.$emit("fermer");
        this.$emit("ajouter", this.intrantLocal);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'intrant:", error);
      }
    },
  },
};
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: auto;
}

.form-control {
  border-radius: 5px;
}

.btn {
  width: 48%;
}
</style>
