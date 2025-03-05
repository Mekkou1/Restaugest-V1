<template>
  <div class="admin d-flex flex-column h-100">
    <!-- Header -->
    <header class="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
      <div class="d-flex align-items-center">
        <img src="@/assets/Logo.png" alt="Logo" class="me-2" style="width: 50px; height: 50px;">
        <h1 class="mb-0">Administrateur</h1>
      </div>
      <div class="date-heure d-flex gap-3">
        <span>Date : {{ date }}</span>
        <span>Heure : {{ heure }}</span>
      </div>
    </header>

    <!-- Contenu principal -->
    <div class="d-flex flex-grow-1 h-100">
      <!-- Sidebar (Menu latéral) -->
      <aside class="bg-light p-3 d-flex flex-column h-100">
        <nav class="flex-grow-1">
          <ul class="list-unstyled">
            <!-- Gestion des comptes -->
            <li class="mb-2" @click="toggleGroup('comptes')">
              <strong>
                <i class="fas fa-users-cog me-2"></i>
                Gestion des comptes
              </strong>
            </li>
            <ul v-if="menuOuvert.comptes" class="list-unstyled ms-3">
              <li 
                class="mb-3 menu-item" 
                :class="{ 'active': sectionActive === 'GestionUtilisateurs' }"
                @click="afficherSection('GestionUtilisateurs')"
              >
                <i class="fas fa-users me-2"></i>
                Utilisateurs
              </li>
              <li 
                class="mb-3 menu-item" 
                :class="{ 'active': sectionActive === 'SessionsActives' }"
                @click="afficherSection('SessionsActives')"
              >
                <i class="fas fa-clock me-2"></i>
                Sessions actives
              </li>
            </ul>

             <!-- Gestion des tables -->
             <li class="mb-2" @click="toggleGroup('tables')">
              <strong>Gestion des salles et tables</strong>
            </li>
            <ul v-if="menuOuvert.tables" class="list-unstyled ms-3">
              <li class="mb-3" @click="afficherSection('Gestionsalles')">Salles</li>
              <li class="mb-3" @click="afficherSection('GestionTables')">Tables</li>
            </ul>
            
            <!-- Gestion des articles -->
            <li class="mb-2" @click="toggleGroup('articles')">
              <strong>Gestion des articles</strong>
            </li>
            <ul v-if="menuOuvert.articles" class="list-unstyled ms-3">
              <li class="mb-3" @click="afficherSection('GestionArticles')">Articles</li>
              <li class="mb-3" @click="afficherSection('GestionFamilles')">Famille d'articles</li>
              <li class="mb-3" @click="afficherSection('GestionPlats')">Plats</li>
              <li class="mb-3" @click="afficherSection('GestionBoissons')">Boissons</li>
              <li class="mb-3" @click="afficherSection('GestionIntrants')">Intrants</li>
              <li class="mb-3" @click="afficherSection('cartemenu')">Cartes Menu</li>
            </ul>

            <!-- Gestion des stocks -->
            <li class="mb-2" @click="toggleGroup('stocks')">
              <strong>Gestion des stocks</strong>
            </li>
            <ul v-if="menuOuvert.stocks" class="list-unstyled ms-3">
              <li class="mb-3" @click="afficherSection('GestionStock')">Inventaire</li>
            </ul>

            <!-- Gestion des commandes -->
            <li class="mb-2" @click="toggleGroup('commandes')">
              <strong>Gestion des commandes</strong>
            </li>
            <ul v-if="menuOuvert.commandes" class="list-unstyled ms-3">
              <li class="mb-3" @click="afficherSection('CommandeListe')">Liste des commandes</li>
              <li class="mb-3" @click="afficherSection('CommandeDetails')">Detail des commandes</li>
            </ul>

            <!-- Comptoir et rapports -->
            <li class="mb-2" @click="toggleGroup('comptoir')">
              <strong>Comptoir et rapports</strong>
            </li>
            <ul v-if="menuOuvert.comptoir" class="list-unstyled ms-3">
              <li class="mb-3" @click="afficherSection('comptoir')">Comptoir</li>
              <li class="mb-3" @click="afficherSection('rapports')">Rapports</li>
            </ul>
          </ul>
        </nav>
      </aside>

      <!-- Contenu principal -->
      <main class="flex-grow-1 p-3 d-flex flex-column">
        <router-view class="flex-grow-1"></router-view>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminVue',
  data() {
    return {
      menuOuvert: {
        comptes: false,
        articles: false,
        stocks: false,
        commandes: false,
        comptoir: false,
      },
      date: new Date().toLocaleDateString(),
      heure: new Date().toLocaleTimeString(),
    };
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    afficherSection(section) {
      // Redirige vers la route admin appropriée, par exemple /admin/utilisateurs
      this.$router.push(`/admin/${section}`);
    },
   
    toggleGroup(group) {
      this.menuOuvert[group] = !this.menuOuvert[group];
    },
    updateTime() {
      this.date = new Date().toLocaleDateString();
      this.heure = new Date().toLocaleTimeString();
    },
  },
};
</script>

<style scoped>
.admin {
  background-color: #ff6600;
  color: white;
  height: 100vh;
}

aside {
  width: 200px;
  height: 100vh;
}

nav ul li {
  cursor: pointer;
  user-select: none;
}

main {
  background-color: #ff6600;
  color: black;
  display: flex;
  flex-direction: column;
}

.date-heure {
  display: flex;
  gap: 10px;
}
</style>
