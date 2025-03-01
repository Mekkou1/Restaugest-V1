<template>
    <div class="table-responsive">
      <h3>Liste des Salles et Tables</h3>
  
      <table class="table table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Réf</th>
            <th>Nom Salle</th>
            <th>Type</th>
            <th>Tables Associées</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(salle, index) in salles" :key="index">
            <td>{{ salle.ref }}</td>
            <td>{{ salle.nom }}</td>
            <td>{{ salle.type }}</td>
            <td>
              <ul>
                <li v-for="table in salle.tables" :key="table.ref">
                  <span :class="tableEtat(table.ref)">
                    {{ table.nom }} ({{ table.type }})
                  </span>
                </li>
              </ul>
            </td>
            <td>
              <button class="btn btn-warning btn-sm me-2" @click="modifierSalle(salle)">✏️</button>
              <button class="btn btn-danger btn-sm" @click="supprimerSalle(index)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    name: "ListesalleTables",
    data() {
      return {
        salles: [
          { ref: "S001", nom: "Salle VIP", type: "VIP", tables: [{ ref: "T001", nom: "Table 1", type: "Carrée" }] },
          { ref: "S002", nom: "Salle Terrasse", type: "Terrasse", tables: [{ ref: "T002", nom: "Table 2", type: "Ronde" }] },
        ],
        tickets: [
          { id: "TICKET001", tableRef: "T001", etat: "Validé", paiementEffectué: false },
        ],
      };
    },
    computed: {
      tablesOccupees() {
        return this.tickets
          .filter(ticket => !ticket.paiementEffectué)
          .map(ticket => ticket.tableRef);
      }
    },
    methods: {
      tableEtat(ref) {
        return this.tablesOccupees.includes(ref) ? "table-occupee" : "table-libre";
      },
      modifierSalle(salle) {
        console.log("Modification en cours pour :", salle);
      },
      supprimerSalle(index) {
        this.salles.splice(index, 1);
      }
    }
  };
  </script>
  
  <style scoped>
  .table-occupee {
    color: red;
    font-weight: bold;
  }
  .table-libre {
    color: green;
    font-weight: bold;
  }
  .table-responsive {
    max-height: 400px;
    overflow-y: auto;
    overflow-x: auto;
  }
  </style>
  