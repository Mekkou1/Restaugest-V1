<template>
  <div class="billetage-manager">
    <h2>Gestion du Billetage</h2>
    <div class="billetage-form">
      <div class="form-group">
        <label>Caisse</label>
        <select v-model="selectedCaisse" class="form-control">
          <option v-for="caisse in caisses" :key="caisse.id" :value="caisse.id">
            Caisse #{{ caisse.id }}
          </option>
        </select>
      </div>
      <div class="billets-list">
        <div v-for="(billet, index) in billets" :key="index" class="billet-item">
          <label>{{ billet.valeur }} {{ devise }}</label>
          <input type="number" v-model="billet.quantite" class="form-control" @change="calculateTotal">
        </div>
      </div>
      <div class="total-section">
        <h3>Total: {{ total }} {{ devise }}</h3>
      </div>
      <button class="btn btn-primary" @click="saveBilletage">Enregistrer</button>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'BilletageManager',
  data() {
    return {
      selectedCaisse: null,
      caisses: [],
      billets: [
        { valeur: 10000, quantite: 0 },
        { valeur: 5000, quantite: 0 },
        { valeur: 2000, quantite: 0 },
        { valeur: 1000, quantite: 0 },
        { valeur: 500, quantite: 0 },
        { valeur: 100, quantite: 0 }
      ],
      devise: 'FCFA',
      total: 0
    }
  },
  methods: {
    async fetchCaisses() {
      try {
        const response = await axios.get('/api/caisses')
        this.caisses = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des caisses:', error)
      }
    },
    calculateTotal() {
      this.total = this.billets.reduce((acc, billet) => {
        return acc + (billet.valeur * billet.quantite)
      }, 0)
    },
    async saveBilletage() {
      try {
        await axios.post('/api/billetage', {
          caisse_id: this.selectedCaisse,
          billets: this.billets
        })
        // Notification de succès
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du billetage:', error)
      }
    }
  },
  mounted() {
    this.fetchCaisses()
  }
}
</script>

<style scoped>
.billetage-manager {
  padding: 20px;
}
.billetage-form {
  max-width: 600px;
  margin: 0 auto;
}
.billet-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.billet-item label {
  width: 150px;
}
.total-section {
  margin: 20px 0;
  text-align: right;
}
</style>
