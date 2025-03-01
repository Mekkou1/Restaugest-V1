<template>
  <div class="formulaire-article card p-4 mt-4">
    <h4 v-if="form.id">Modifier l'article</h4>
    <h4 v-else>Ajouter un nouvel article</h4>

    <form @submit.prevent="validerFormulaire">
      <div class="mb-2">
        <label>Type :</label>
        <select v-model="form.type" class="form-control" required>
          <option value="plat">Plat</option>
          <option value="boisson">Boisson</option>
          <option value="intrant">Intrant</option>
        </select>
      </div>

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
        <select v-model="form.famille" class="form-control" required>
          <option value="1">Entrées</option>
          <option value="2">Plats</option>
          <option value="3">Desserts</option>
          <option value="4">Boissons</option>
        </select>
      </div>

      <div class="mb-2">
        <label v-if="form.type !== 'intrant'">Prix :</label>
        <label v-else>Stock :</label>
        <input type="number" v-model="form.prix" class="form-control" required>
      </div>

      <div class="mb-2" v-if="form.type !== 'intrant'">
        <label>Image (facultatif) :</label>
        <input type="file" class="form-control" @change="handleImage">
      </div>

      <div class="d-flex justify-content-between mt-3">
        <button type="submit" class="btn btn-success">Sauvegarder</button>
        <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Annuler</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FormulaireArticle",
  props: {
    article: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      form: {
        id: null,
        type: "plat",
        ref: "",
        designation: "",
        famille: "",
        prix: 0,
        image_url: null,
      },
      imageFile: null,
    };
  },
  watch: {
    article: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal };
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleImage(event) {
      this.imageFile = event.target.files[0];
    },
    async validerFormulaire() {
      try {
        const response = this.form.id
          ? await axios.put(`http://localhost:5000/api/articles/${this.form.id}`, this.form)
          : await axios.post("http://localhost:5000/api/articles", this.form);

        this.$emit("sauvegarder", response.data);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    },
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
  