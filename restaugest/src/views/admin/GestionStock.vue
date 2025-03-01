<template>
  <div class="gestion-stock container mt-4">
    <h2 class="text-center">Gestion des Stocks</h2>

    <div v-if="alertes.length > 0" class="alert alert-danger">
      <strong>Attention !</strong> Certains articles sont en dessous du seuil :
      <ul>
        <li v-for="alerte in alertes" :key="alerte.id">
          {{ alerte.designation }} (Stock : {{ alerte.stock }}, Seuil : {{ alerte.seuil_alerte }})
        </li>
      </ul>
    </div>

    <!-- Tableau des stocks -->
    <div class="table-responsive mt-3">
      <table class="table table-striped">
        <thead class="table-dark">
          <tr>
            <th>Type</th>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Stock Disponible</th>
            <th>Seuil d'Alerte</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in stocks" :key="article.id">
            <td>{{ article.type }}</td>
            <td>{{ article.ref }}</td>
            <td>{{ article.designation }}</td>
            <td :class="article.stock < article.seuil_alerte ? 'text-danger fw-bold' : ''">
              {{ article.stock }}
            </td>
            <td>{{ article.seuil_alerte }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "GestionStock",
  data() {
    return {
      stocks: [],
      alertes: [],
    };
  },
  mounted() {
    this.chargerStocks();
  },
  methods: {
    async chargerStocks() {
      try {
        const response = await axios.get("http://localhost:5000/api/stock");
        this.stocks = response.data;

        // Vérifier les seuils d’alerte
        this.alertes = this.stocks.filter(article => article.stock < article.seuil_alerte);
      } catch (error) {
        console.error("Erreur de chargement des stocks:", error);
      }
    },
  },
};
</script>

<style scoped>
.gestion-stock {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.text-danger {
  color: red;
}

.fw-bold {
  font-weight: bold;
}
</style>
