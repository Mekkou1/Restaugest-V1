<template>
  <!-- Le template reste inchangé -->
  <DashboardLayout :title="'Module Cuisine'" :menuItems="menuItems">
    <div class="container-fluid">
      <!-- En-tête avec statistiques -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">En attente</h5>
              <p class="card-text amount">{{ getCommandesParEtat('En attente').length }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">En préparation</h5>
              <p class="card-text amount">{{ getCommandesParEtat('En préparation').length }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Prêtes</h5>
              <p class="card-text amount">{{ getCommandesParEtat('Prête').length }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Servies</h5>
              <p class="card-text amount">{{ getCommandesParEtat('Servie').length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="btn-group">
            <button 
              v-for="etat in etats" 
              :key="etat"
              class="btn"
              :class="filtreEtat === etat ? 'btn-primary' : 'btn-outline-primary'"
              @click="filtreEtat = etat"
            >
              {{ etat }}
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Rechercher une commande..."
              v-model="recherche"
            >
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Liste des commandes -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Table</th>
                      <th>Plat</th>
                      <th>Quantité</th>
                      <th>Heure</th>
                      <th>État</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="commande in commandesFiltrees" :key="commande.id">
                      <td>{{ commande.ticket }}</td>
                      <td>{{ commande.table }}</td>
                      <td>{{ commande.designation }}</td>
                      <td>{{ commande.quantite }}</td>
                      <td>{{ formatHeure(commande.heure) }}</td>
                      <td>
                        <span :class="getBadgeClass(commande.etat)">
                          {{ commande.etat }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button 
                            v-if="commande.etat === 'En attente'"
                            class="btn btn-warning btn-sm"
                            @click="updateEtat(commande.id, 'En préparation')"
                          >
                            <i class="fas fa-fire"></i> Préparer
                          </button>
                          <button 
                            v-if="commande.etat === 'En préparation'"
                            class="btn btn-success btn-sm"
                            @click="updateEtat(commande.id, 'Prête')"
                          >
                            <i class="fas fa-check"></i> Terminer
                          </button>
                          <button 
                            v-if="commande.etat === 'Prête'"
                            class="btn btn-primary btn-sm"
                            @click="updateEtat(commande.id, 'Servie')"
                          >
                            <i class="fas fa-utensils"></i> Servir
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'CuisineVue',
  components: {
  },
  setup() {
    const commandes = ref([])
    const filtreEtat = ref('Tous')
    const recherche = ref('')
    const loading = ref(false)

    const menuItems = [
      { 
        name: 'commandes', 
        label: 'Commandes', 
        path: '/cuisine/commandes',
        icon: 'fas fa-utensils'
      },
      { 
        name: 'historique', 
        label: 'Historique', 
        path: '/cuisine/historique',
        icon: 'fas fa-history'
      }
    ]

    const etats = ['Tous', 'En attente', 'En préparation', 'Prête', 'Servie']

    const commandesFiltrees = computed(() => {
      let result = commandes.value

      if (filtreEtat.value !== 'Tous') {
        result = result.filter(c => c.etat === filtreEtat.value)
      }

      if (recherche.value) {
        const searchTerm = recherche.value.toLowerCase()
        result = result.filter(c => 
          c.ticket.toString().includes(searchTerm) ||
          c.table.toLowerCase().includes(searchTerm) ||
          c.designation.toLowerCase().includes(searchTerm)
        )
      }

      return result
    })

    const getCommandesParEtat = (etat) => {
      return commandes.value.filter(c => c.etat === etat)
    }

    const fetchCommandes = async () => {
      loading.value = true
      try {
        const response = await api.get('/cuisine/commandes')
        commandes.value = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error)
      } finally {
        loading.value = false
      }
    }

    const updateEtat = async (commandeId, nouvelEtat) => {
      try {
        await api.put(`/cuisine/commandes/${commandeId}/etat`, { etat: nouvelEtat })
        await fetchCommandes()
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'état:', error)
      }
    }

    const getBadgeClass = (etat) => {
      const classes = {
        'En attente': 'badge bg-secondary',
        'En préparation': 'badge bg-warning text-dark',
        'Prête': 'badge bg-success',
        'Servie': 'badge bg-primary'
      }
      return classes[etat] || 'badge bg-secondary'
    }

    const formatHeure = (date) => {
      return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      fetchCommandes()
      // Rafraîchir les commandes toutes les 30 secondes
      const interval = setInterval(fetchCommandes, 30000)
      
      onUnmounted(() => {
        clearInterval(interval)
      })
    })

    return {
      commandes,
      menuItems,
      etats,
      filtreEtat,
      recherche,
      loading,
      commandesFiltrees,
      getCommandesParEtat,
      updateEtat,
      getBadgeClass,
      formatHeure
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.card-title {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6600;
  margin: 0;
}

.badge {
  padding: 0.5em 0.75em;
  font-size: 0.875rem;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.table th {
  font-weight: 600;
  color: #666;
}

.table td {
  vertical-align: middle;
}

/* Animation pour les mises à jour d'état */
.badge {
  transition: all 0.3s ease;
}

/* Style des boutons */
.btn-primary {
  background-color: #ff6600;
  border-color: #ff6600;
}

.btn-primary:hover {
  background-color: #e65c00;
  border-color: #e65c00;
}

.btn-outline-primary {
  color: #ff6600;
  border-color: #ff6600;
}

.btn-outline-primary:hover {
  background-color: #ff6600;
  border-color: #ff6600;
}
</style>
