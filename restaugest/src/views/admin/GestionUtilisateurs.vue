<template>
  <div class="gestion-utilisateurs container mt-4">
    <div v-if="!afficherFormulaire">
      <div class="header-bar d-flex justify-content-between align-items-center flex-wrap">
        <h2 class="mb-3">Gestion des Utilisateurs</h2>
        <button class="btn btn-primary" @click="afficherFormulaire = true">+ Nouvel utilisateur</button>
      </div>

      <!-- Tableau des utilisateurs -->
      <div class="table-responsive">
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th class="d-none d-md-table-cell">Pseudo</th>
              <th>Rôle</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in utilisateurs" :key="index">
              <td>{{ user.nom }}</td>
              <td>{{ user.prenom }}</td>
              <td class="d-none d-md-table-cell">{{ user.pseudo }}</td>
              <td>{{ user.role }}</td>
              <td>
                <span class="badge" :class="user.connecte ? 'bg-success' : 'bg-danger'">
                  {{ user.connecte ? 'Connecté' : 'Déconnecté' }}
                </span>
              </td>
              <td>
                <button class="btn btn-warning btn-sm me-2" @click="modifierUtilisateur(index)">✏️</button>
                <button class="btn btn-danger btn-sm" @click="supprimerUtilisateur(index)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulaire d'ajout/modification utilisateur (Affiché si afficherFormulaire est vrai) -->
    <FormulaireUtilisateur v-if="afficherFormulaire" @fermer="afficherFormulaire = false" @sauvegarder="sauvegarderUtilisateur" :utilisateur="utilisateurEnCours" />
  </div>
</template>

<script>
import FormulaireUtilisateur from '@/views/admin/FormulaireUtilisateur.vue';
import axios from 'axios';

export default {
  name: "GestionUtilisateurs",
  components: { FormulaireUtilisateur },
  data() {
    return {
      utilisateurs: [],
      afficherFormulaire: false,
      utilisateurEnCours: {},
    };
  },
  methods: {
    async fetchUtilisateurs() {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        this.utilisateurs = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    },
    modifierUtilisateur(index) {
      this.utilisateurEnCours = { ...this.utilisateurs[index] };
      this.afficherFormulaire = true;
    },
    supprimerUtilisateur(index) {
      if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
        axios.delete(`http://localhost:5000/api/users/${this.utilisateurs[index].id}`)
          .then(() => {
            this.utilisateurs.splice(index, 1);
          })
          .catch(error => {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
          });
      }
    },
    sauvegarderUtilisateur(utilisateur) {
      this.utilisateurs.push(utilisateur);
      this.afficherFormulaire = false;
      this.utilisateurEnCours = {};
    },
  },
  created() {
    this.fetchUtilisateurs();
  },
};
</script>

<style scoped>
.gestion-utilisateurs {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}

.btn-sm {
  padding: 5px 10px;
}

.badge {
  font-size: 14px;
}
</style>
