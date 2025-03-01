<template>
    <div class="gestion-tables container mt-4">
      <div v-if="!afficherFormulaire" class="header-bar d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 class="mb-3">Gestion des Tables</h2>
        <button class="btn btn-primary" @click="afficherFormulaire = true">+ Nouvelle Table</button>
      </div>
  
      <!-- Liste des Tables -->
      <div v-if="!afficherFormulaire" class="table-responsive mb-4">
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Nom</th>
              <th>Salle</th>
              <th>Type</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(table, index) in tables" :key="index" :class="{'table-success': table.etat === 'Libre', 'table-danger': table.etat === 'Occupée'}">
              <td>{{ table.nom }}</td>
              <td>{{ table.salle_nom }}</td>
              <td>{{ table.type }}</td>
              <td>{{ table.etat }}</td>
              <td>
                <button class="btn btn-warning btn-sm me-2" @click="modifierTable(index)">✏️</button>
                <button class="btn btn-danger btn-sm" @click="supprimerTable(index)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Formulaire d'ajout/modification de Table -->
      <FormTable v-if="afficherFormulaire" @fermer="afficherFormulaire = false" @ajouter="ajouterTable" @modifier="modifierTable" :table="tableEnCours" :salles="salles" />
    </div>
  </template>
  
  <script>
  import FormTable from '@/views/admin/FormTable.vue';
  import axios from 'axios';
  
  export default {
    name: "GestionTables",
    components: { FormTable },
    data() {
      return {
        tables: [],
        salles: [],
        afficherFormulaire: false,
        tableEnCours: {},
      };
    },
    methods: {
      async fetchTables() {
        try {
          const responseTables = await axios.get('http://localhost:5000/api/tables');
          const responseSalles = await axios.get('http://localhost:5000/api/salles');
          this.tables = responseTables.data;
          this.salles = responseSalles.data;
          this.updateTableStatuses();
        } catch (error) {
          console.error('Erreur lors de la récupération des tables:', error);
        }
      },
      async updateTableStatuses() {
        for (let table of this.tables) {
          const response = await axios.get(`http://localhost:5000/api/tickets?table_id=${table.id}`);
          const tickets = response.data;
          table.etat = tickets.some(ticket => ticket.etat !== 'Payé') ? 'Occupée' : 'Libre';
        }
      },
      modifierTable(index) {
        this.tableEnCours = { ...this.tables[index] };
        this.afficherFormulaire = true;
      },
      supprimerTable(index) {
        if (confirm("Voulez-vous vraiment supprimer cette table ?")) {
          axios.delete(`http://localhost:5000/api/tables/${this.tables[index].id}`)
            .then(() => {
              this.tables.splice(index, 1);
            })
            .catch(error => {
              console.error('Erreur lors de la suppression de la table:', error);
            });
        }
      },
      ajouterTable(table) {
        this.tables.push(table);
        this.afficherFormulaire = false;
        this.tableEnCours = {};
        this.updateTableStatuses();
      },
    },
    created() {
      this.fetchTables();
    },
  };
  </script>
  
  <style scoped>
  .gestion-tables {
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
  