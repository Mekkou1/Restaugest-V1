<template>
  <div class="card p-4 mt-4">
    <h4>{{ modeEdition ? "Modifier la Boisson" : "Ajouter une Boisson" }}</h4>
    <form @submit.prevent="validerFormulaire">
      <div class="mb-2">
        <label>Référence :</label>
        <input type="text" v-model="formData.ref" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Désignation :</label>
        <input type="text" v-model="formData.designation" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Famille :</label>
        <select v-model="formData.famille_id" class="form-control" required>
          <option v-for="famille in familles" :key="famille.id" :value="famille.id">{{ famille.nom }}</option>
        </select>
      </div>
      <div class="mb-2">
        <label>Prix (FCFA) :</label>
        <input type="number" v-model="formData.prix" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Stock :</label>
        <input type="number" v-model="formData.stock" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Seuil d'alerte :</label>
        <input type="number" v-model="formData.seuil_alerte" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Image :</label>
        <input type="file" @change="selectionnerImage" class="form-control">
      </div>

      <div class="d-flex justify-content-between mt-3">
        <button type="submit" class="btn btn-success">{{ modeEdition ? "Modifier" : "Ajouter" }}</button>
        <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Annuler</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FormulaireBoisson",
  props: {
    boisson: {
      type: Object,
      required: false,
      default: () => ({
        ref: "",
        designation: "",
        famille_id: null,
        prix: "",
        stock: "",
        seuil_alerte: "",
        image: null
      })
    }
  },
  data() {
    return {
      formData: { ...this.boisson }, // ✅ On fait une copie locale des données
      familles: [],
      modeEdition: false,
      imageFile: null
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
        console.error("Erreur lors du chargement des familles:", error);
      }
    },
    selectionnerImage(event) {
      this.imageFile = event.target.files[0];
    },
    async validerFormulaire() {
      const formData = new FormData();
      formData.append("ref", this.formData.ref);
      formData.append("designation", this.formData.designation);
      formData.append("famille_id", this.formData.famille_id);
      formData.append("prix", this.formData.prix);
      formData.append("stock", this.formData.stock);
      formData.append("seuil_alerte", this.formData.seuil_alerte);
      if (this.imageFile) {
        formData.append("image", this.imageFile);
      }

      try {
        const response = await axios.post("http://localhost:5000/api/boissons", formData);
        alert(response.data.message);
        this.$emit("sauvegarder");
      } catch (error) {
        console.error("Erreur lors de l'ajout de la boisson:", error);
      }
    }
  }
};
</script>
