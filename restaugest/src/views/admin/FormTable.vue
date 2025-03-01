<template>
    <div class="card p-4 mt-4">
      <h4>{{ mode === 'ajouter' ? 'Ajouter' : 'Modifier' }} une Table</h4>
      <form @submit.prevent="validerFormulaire">
        <div class="mb-2">
          <label>Nom :</label>
          <input type="text" v-model="tableLocal.nom" class="form-control" required>
        </div>
        <div class="mb-2">
          <label>Salle :</label>
          <select v-model="tableLocal.salle_id" class="form-control" required>
            <option v-for="salle in salles" :key="salle.id" :value="salle.id">{{ salle.nom }}</option>
          </select>
        </div>
        <div class="mb-2">
          <label>Type :</label>
          <select v-model="tableLocal.type" class="form-control" required>
            <option value="Carrée">Carrée</option>
            <option value="Ronde">Ronde</option>
            <option value="Rectangulaire">Rectangulaire</option>
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
    name: "FormTable",
    props: {
      mode: {
        type: String,
        default: 'ajouter',
      },
      table: Object,
      salles: Array,
    },
    data() {
      return {
        tableLocal: { ...this.table },
      };
    },
    watch: {
      table: {
        handler(newValue) {
          this.tableLocal = { ...newValue };
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async validerFormulaire() {
        try {
          if (this.mode === 'ajouter') {
            await axios.post('http://localhost:5000/api/tables', this.tableLocal);
          } else {
            await axios.put(`http://localhost:5000/api/tables/${this.tableLocal.id}`, this.tableLocal);
          }
          this.$emit(this.mode, this.tableLocal);
          this.$emit('fermer');
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la table:', error);
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
  