<template>
  <header class="header-admin d-flex justify-content-between align-items-center p-3 bg-dark text-white">
    <div class="d-flex align-items-center">
      <img src="@/assets/Logo.png" alt="Logo" class="logo me-2">
      <div class="user-info">
        <h5 class="mb-0">{{ username }}</h5>
        <small>{{ userRole }}</small>
      </div>
    </div>
    <div class="d-flex align-items-center">
      <div class="date-heure me-4">
        <div>{{ date }}</div>
        <div>{{ heure }}</div>
      </div>
      <button @click="logout" class="btn btn-outline-light">
        <i class="fas fa-sign-out-alt"></i>
        Déconnexion
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderAdmin',
  props: {
    username: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      date: new Date().toLocaleDateString(),
      heure: new Date().toLocaleTimeString(),
      timer: null,
      userRole: localStorage.getItem('role') || 'Utilisateur'
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    updateTime() {
      this.date = new Date().toLocaleDateString()
      this.heure = new Date().toLocaleTimeString()
    },
    logout() {
      // Supprimer les informations de session
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('userName')
      // Rediriger vers la page de connexion
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.header-admin {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.user-info {
  margin-left: 1rem;
}

.date-heure {
  text-align: right;
  font-size: 0.9rem;
}

.btn-outline-light {
  border-width: 2px;
}

.btn-outline-light:hover {
  background-color: rgba(255,255,255,0.1);
}

small {
  color: #adb5bd;
  font-size: 0.8rem;
}
</style>
