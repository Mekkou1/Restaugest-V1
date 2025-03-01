<template>
  <div class="stock-tracker">
    <h2>Suivi des Stocks</h2>
    <div class="filters">
      <select v-model="selectedType" class="form-control">
        <option value="all">Tous les articles</option>
        <option value="Intrant">Intrants</option>
        <option value="Boisson">Boissons</option>
      </select>
      <div class="alert-filter">
        <input type="checkbox" v-model="showAlerts" id="showAlerts">
        <label for="showAlerts">Afficher uniquement les alertes</label>
      </div>
    </div>

    <div class="stock-list">
      <table class="table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Type</th>
            <th>Stock actuel</th>
            <th>Seuil d'alerte</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredStockItems" :key="item.id" 
              :class="{'alert-row': item.stock <= item.seuil_alerte}">
            <td>{{ item.ref }}</td>
            <td>{{ item.designation }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.stock }}</td>
            <td>{{ item.seuil_alerte }}</td>
            <td>
              <span :class="getStatusClass(item)">
                {{ getStatusText(item) }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-primary" @click="adjustStock(item)">
                Ajuster
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal d'ajustement du stock -->
    <div v-if="showAdjustModal" class="modal">
      <div class="modal-content">
        <h3>Ajuster le stock</h3>
        <div class="form-group">
          <label>Quantité à ajouter/retirer</label>
          <input type="number" v-model="adjustmentQuantity" class="form-control">
        </div>
        <div class="form-group">
          <label>Motif</label>
          <textarea v-model="adjustmentReason" class="form-control"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancelAdjustment">Annuler</button>
          <button class="btn btn-primary" @click="saveAdjustment">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'StockTracker',
  data() {
    return {
      selectedType: 'all',
      showAlerts: false,
      stockItems: [],
      showAdjustModal: false,
      adjustmentQuantity: 0,
      adjustmentReason: '',
      selectedItem: null
    }
  },
  computed: {
    filteredStockItems() {
      return this.stockItems.filter(item => {
        const typeMatch = this.selectedType === 'all' || item.type === this.selectedType
        const alertMatch = !this.showAlerts || item.stock <= item.seuil_alerte
        return typeMatch && alertMatch
      })
    }
  },
  methods: {
    async fetchStockData() {
      try {
        const response = await axios.get('/api/stock')
        this.stockItems = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des stocks:', error)
      }
    },
    getStatusClass(item) {
      if (item.stock <= 0) return 'status-critical'
      if (item.stock <= item.seuil_alerte) return 'status-warning'
      return 'status-normal'
    },
    getStatusText(item) {
      if (item.stock <= 0) return 'Rupture'
      if (item.stock <= item.seuil_alerte) return 'Alerte'
      return 'Normal'
    },
    adjustStock(item) {
      this.selectedItem = item
      this.showAdjustModal = true
      this.adjustmentQuantity = 0
      this.adjustmentReason = ''
    },
    async saveAdjustment() {
      try {
        await axios.post('/api/stock/adjust', {
          article_id: this.selectedItem.id,
          quantite: this.adjustmentQuantity,
          motif: this.adjustmentReason
        })
        this.showAdjustModal = false
        this.fetchStockData()
      } catch (error) {
        console.error('Erreur lors de l\'ajustement du stock:', error)
      }
    },
    cancelAdjustment() {
      this.showAdjustModal = false
      this.selectedItem = null
    }
  },
  mounted() {
    this.fetchStockData()
  }
}
</script>

<style scoped>
.stock-tracker {
  padding: 20px;
}
.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.alert-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stock-list {
  margin-top: 20px;
}
.alert-row {
  background-color: rgba(255, 0, 0, 0.1);
}
.status-critical {
  color: red;
  font-weight: bold;
}
.status-warning {
  color: orange;
  font-weight: bold;
}
.status-normal {
  color: green;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
