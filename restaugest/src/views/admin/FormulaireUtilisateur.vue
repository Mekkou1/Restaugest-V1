<template>
  <div class="card p-4 mt-4">
    <h4>{{ utilisateurLocal.id ? "Modifier" : "Ajouter" }} un utilisateur</h4>
    <form @submit.prevent="validerFormulaire" class="needs-validation" novalidate>
      <div class="row">
        <!-- Informations personnelles -->
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label">Nom :</label>
            <input 
              type="text" 
              v-model="utilisateurLocal.nom" 
              class="form-control" 
              required
              :class="{ 'is-invalid': errors.nom }"
            >
            <div class="invalid-feedback">{{ errors.nom }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Prénom :</label>
            <input 
              type="text" 
              v-model="utilisateurLocal.prenom" 
              class="form-control" 
              required
              :class="{ 'is-invalid': errors.prenom }"
            >
            <div class="invalid-feedback">{{ errors.prenom }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Email :</label>
            <input 
              type="email" 
              v-model="utilisateurLocal.email" 
              class="form-control" 
              required
              :class="{ 'is-invalid': errors.email }"
            >
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>
        </div>

        <!-- Informations de compte -->
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label">Pseudo :</label>
            <input 
              type="text" 
              v-model="utilisateurLocal.pseudo" 
              class="form-control" 
              required
              minlength="3"
              maxlength="50"
              :class="{ 'is-invalid': errors.pseudo }"
            >
            <div class="invalid-feedback">{{ errors.pseudo }}</div>
          </div>
          <div class="mb-3" v-if="!utilisateurLocal.id">
            <label class="form-label">Mot de passe :</label>
            <input 
              type="password" 
              v-model="utilisateurLocal.mot_de_passe" 
              class="form-control" 
              required
              minlength="6"
              :class="{ 'is-invalid': errors.mot_de_passe }"
            >
            <div class="invalid-feedback">{{ errors.mot_de_passe }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Rôle :</label>
            <select 
              v-model="utilisateurLocal.role" 
              class="form-select" 
              required
              :class="{ 'is-invalid': errors.role }"
            >
              <option value="">Sélectionner un rôle</option>
              <option v-if="isAdmin" value="Administrateur">Administrateur</option>
              <option value="Caissier">Caissier</option>
              <option value="Serveur">Serveur</option>
              <option value="Cuisinier">Cuisinier</option>
            </select>
            <div class="invalid-feedback">{{ errors.role }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">État :</label>
            <select 
              v-model="utilisateurLocal.etat" 
              class="form-select"
              :class="{ 'is-invalid': errors.etat }"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Suspendu">Suspendu</option>
            </select>
            <div class="invalid-feedback">{{ errors.etat }}</div>
          </div>
        </div>
      </div>

      <!-- Informations de connexion (en lecture seule pour la modification) -->
      <div class="row mt-3" v-if="utilisateurLocal.id">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label">Dernière connexion :</label>
            <input 
              type="text" 
              :value="formatDate(utilisateurLocal.derniere_connexion)" 
              class="form-control" 
              readonly
            >
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label">Tentatives de connexion :</label>
            <input 
              type="text" 
              :value="utilisateurLocal.tentatives_connexion" 
              class="form-control" 
              readonly
            >
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between mt-4">
        <button type="submit" class="btn btn-success" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ utilisateurLocal.id ? "Modifier" : "Ajouter" }}
        </button>
        <button type="button" class="btn btn-secondary" @click="$emit('fermer')">
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: "FormulaireUtilisateur",
  props: {
    utilisateur: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const loading = ref(false);
    const errors = ref({});

    const utilisateurLocal = ref({
      id: props.utilisateur?.id || null,
      nom: props.utilisateur?.nom || '',
      prenom: props.utilisateur?.prenom || '',
      pseudo: props.utilisateur?.pseudo || '',
      email: props.utilisateur?.email || '',
      mot_de_passe: '',
      role: props.utilisateur?.role || '',
      etat: props.utilisateur?.etat || 'Actif',
      derniere_connexion: props.utilisateur?.derniere_connexion || null,
      tentatives_connexion: props.utilisateur?.tentatives_connexion || 0,
      bloque_jusqu_a: props.utilisateur?.bloque_jusqu_a || null
    });

    const isAdmin = computed(() => {
      return store.state.auth.user?.role === 'Administrateur';
    });

    const validateForm = () => {
      const newErrors = {};
      
      if (!utilisateurLocal.value.nom) newErrors.nom = 'Le nom est requis';
      if (!utilisateurLocal.value.prenom) newErrors.prenom = 'Le prénom est requis';
      
      if (!utilisateurLocal.value.pseudo) {
        newErrors.pseudo = 'Le pseudo est requis';
      } else if (utilisateurLocal.value.pseudo.length < 3) {
        newErrors.pseudo = 'Le pseudo doit contenir au moins 3 caractères';
      }

      if (!utilisateurLocal.value.email) {
        newErrors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(utilisateurLocal.value.email)) {
        newErrors.email = 'L\'email n\'est pas valide';
      }

      if (!utilisateurLocal.value.id && !utilisateurLocal.value.mot_de_passe) {
        newErrors.mot_de_passe = 'Le mot de passe est requis';
      } else if (!utilisateurLocal.value.id && utilisateurLocal.value.mot_de_passe.length < 6) {
        newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
      }

      if (!utilisateurLocal.value.role) newErrors.role = 'Le rôle est requis';

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const formatDate = (date) => {
      if (!date) return 'Jamais';
      return new Date(date).toLocaleString();
    };

    const validerFormulaire = async () => {
      if (!validateForm()) return;

      loading.value = true;
      try {
        const action = utilisateurLocal.value.id ? 'updateUser' : 'createUser';
        await store.dispatch(`users/${action}`, utilisateurLocal.value);
        emit('sauvegarder', utilisateurLocal.value);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        if (error.response?.data?.errors) {
          errors.value = error.response.data.errors;
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      utilisateurLocal,
      loading,
      errors,
      isAdmin,
      formatDate,
      validerFormulaire
    };
  }
};
</script>

<style scoped>
.card {
  max-width: 800px;
  margin: auto;
}

.form-control, .form-select {
  border-radius: 5px;
}

.btn {
  min-width: 120px;
}

.form-control[readonly] {
  background-color: #f8f9fa;
}
</style>
