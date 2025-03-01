<template>
  <div class="card p-4 mt-4">
    <h4>{{ utilisateurLocal.id ? "Modifier" : "Ajouter" }} un utilisateur</h4>
    <form @submit.prevent="validerFormulaire">
      <div class="mb-2">
        <label>Nom :</label>
        <input type="text" v-model="utilisateurLocal.nom" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Prénom :</label>
        <input type="text" v-model="utilisateurLocal.prenom" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Pseudo :</label>
        <input type="text" v-model="utilisateurLocal.pseudo" class="form-control" required>
      </div>
      <div class="mb-2" v-if="!utilisateurLocal.id">
        <label>Mot de passe :</label>
        <input type="password" v-model="utilisateurLocal.motDePasse" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Contact 1 :</label>
        <input type="text" v-model="utilisateurLocal.contact1" class="form-control" required>
      </div>
      <div class="mb-2">
        <label>Contact 2 :</label>
        <input type="text" v-model="utilisateurLocal.contact2" class="form-control">
      </div>
      <div class="mb-2">
        <label>Rôle :</label>
        <select v-model="utilisateurLocal.role" class="form-control" required>
          <option value="Cuisinier">Cuisinier</option>
          <option value="Caissier(e)">Caissier(e)</option>
          <option value="Serveur">Serveur</option>
          <option value="Gerant(e)">Gerant(e)</option>
          <option value="Administrateur">Administrateur</option>
        </select>
      </div>

      <div class="d-flex justify-content-between mt-3">
        <button type="submit" class="btn btn-success">{{ utilisateurLocal.id ? "Modifier" : "Ajouter" }}</button>
        <button type="button" class="btn btn-secondary" @click="$emit('fermer')">Annuler</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "FormulaireUtilisateur",
  props: {
    utilisateur: Object,
  },
  data() {
    return {
      utilisateurLocal: { ...this.utilisateur },
    };
  },
  watch: {
    utilisateur: {
      handler(newValue) {
        this.utilisateurLocal = { ...newValue };
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async validerFormulaire() {
      try {
        if (this.utilisateurLocal.id) {
          // Modifier un utilisateur existant
          await axios.put(`http://localhost:5000/api/users/${this.utilisateurLocal.id}`, this.utilisateurLocal);
        } else {
          // Ajouter un nouvel utilisateur
          await axios.post('http://localhost:5000/api/users/register', this.utilisateurLocal);
        }
        this.$emit("sauvegarder", this.utilisateurLocal);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
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
