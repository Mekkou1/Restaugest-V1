<template>
    <div class="card p-4 mt-4">
      <h4>{{ plat ? "Modifier un Plat" : "Ajouter un Nouveau Plat" }}</h4>
      <form @submit.prevent="validerFormulaire">
        <div class="mb-2">
          <label>Référence :</label>
          <input type="text" v-model="form.ref" class="form-control" required>
        </div>
        <div class="mb-2">
          <label>Désignation :</label>
          <input type="text" v-model="form.designation" class="form-control" required>
        </div>
        <div class="mb-2">
          <label>Famille :</label>
          <select v-model="form.famille_id" class="form-control" required>
            <option v-for="famille in familles" :key="famille.id" :value="famille.id">{{ famille.nom }}</option>
          </select>
        </div>
        <div class="mb-2">
          <label>Prix :</label>
          <input type="number" v-model="form.prix" class="form-control" required>
        </div>
  
        <!-- Upload d'image -->
        <div class="mb-2">
          <label>Image (optionnel) :</label>
          <input type="file" class="form-control" @change="uploadImage">
        </div>
  
        <div class="d-flex justify-content-between mt-3">
          <button type="submit" class="btn btn-success">{{ plat ? "Mettre à Jour" : "Ajouter" }}</button>
          <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Annuler</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "FormulairePlat",
    props: ["plat"],
    data() {
      return {
        form: {
          ref: "",
          designation: "",
          famille_id: "",
          prix: "",
          image: null,
        },
        familles: [],
      };
    },
    mounted() {
      this.chargerFamilles();
      if (this.plat) {
        this.form = { ...this.plat };
      }
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
      uploadImage(event) {
        const file = event.target.files[0];
        if (file) {
          this.form.image = file;
        }
      },
      async validerFormulaire() {
        try {
          const formData = new FormData();
          formData.append("ref", this.form.ref);
          formData.append("designation", this.form.designation);
          formData.append("famille_id", this.form.famille_id);
          formData.append("prix", this.form.prix);
          if (this.form.image) {
            formData.append("image_url", this.form.image);
          }
  
          if (this.plat) {
            await axios.put(`http://localhost:5000/api/plats/${this.plat.id}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } else {
            await axios.post("http://localhost:5000/api/plats", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
  
          this.$emit("majListe");
          this.$emit("fermer");
        } catch (error) {
          console.error("Erreur lors de l'ajout/modification :", error);
        }
      }
    },
  };
  </script>
  
  <style scoped>
  .card {
    max-width: 500px;
    margin: auto;
  }
  
  .form-control {
    border-radius: 5px;
  }
  
  .btn {
    width: 48%;
  }
  </style>
  