<template>
    <div class="card p-4 mt-4">
      <h4>{{ mode === 'ajouter' ? 'Ajouter' : 'Modifier' }} une Salle</h4>
      <form @submit.prevent="validerFormulaire">
        <div class="mb-2">
          <label>Référence :</label>
          <input type="text" v-model="salleLocal.ref" class="form-control" required>
        </div>
        <div class="mb-2">
          <label>Nom :</label>
          <input type="text" v-model="salleLocal.nom" class="form-control" required>
        </div>
        <div class="mb-2">
          <label>Type :</label>
          <select v-model="salleLocal.type" class="form-control" required>
            <option value="VIP">VIP</option>
            <option value="Terrasse">Terrasse</option>
            <option value="Salle Normale">Salle Normale</option>
          </select>
        </div>
  
        <div class="d-flex justify-content-between mt-3">
          <button type="submit" class="btn btn-success">{{ mode === 'ajouter' ? 'Ajouter' : 'Modifier' }}</button>
          <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Retour</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: "FormSalle",
    props: {
      mode: {
        type: String,
        default: 'ajouter',
      },
      salle: Object,
    },
    data() {
      return {
        salleLocal: { ...this.salle },
      };
    },
    watch: {
      salle: {
        handler(newValue) {
          this.salleLocal = { ...newValue };
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async validerFormulaire() {
        try {
          if (this.mode === 'ajouter') {
            await axios.post('http://localhost:5000/api/salles', this.salleLocal);
          } else {
            await axios.put(`http://localhost:5000/api/salles/${this.salleLocal.id}`, this.salleLocal);
          }
          this.$emit(this.mode, this.salleLocal);
          this.$emit('fermer');
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la salle:', error);
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
  