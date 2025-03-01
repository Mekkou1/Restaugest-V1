<template>
  <div class="card p-4 mt-4">
    <h4>{{ mode === 'ajouter' ? 'Ajouter' : 'Modifier' }} une Famille d'Article</h4>
    <form @submit.prevent="validerFormulaire">
      <div class="mb-2">
        <label>Nom :</label>
        <input type="text" v-model="familleLocal.nom" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Description :</label>
        <textarea v-model="familleLocal.description" class="form-control" required></textarea>
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
  name: "FormulaireFamille",
  props: {
    mode: {
      type: String,
      default: 'ajouter',
    },
    famille: Object,
  },
  data() {
    return {
      familleLocal: { ...this.famille },
    };
  },
  watch: {
    famille: {
      handler(newValue) {
        this.familleLocal = { ...newValue };
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async validerFormulaire() {
      try {
        if (this.mode === 'ajouter') {
          await axios.post('http://localhost:5000/api/familles', this.familleLocal);
        } else {
          await axios.put(`http://localhost:5000/api/familles/${this.familleLocal.id}`, this.familleLocal);
        }
        this.$emit(this.mode, this.familleLocal);
        this.$emit('fermer');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la famille:', error);
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
