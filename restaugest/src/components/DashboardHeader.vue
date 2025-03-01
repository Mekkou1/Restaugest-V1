<template>
  <header class="dashboard-header d-flex justify-content-between align-items-center p-3 bg-dark text-white">
    <div class="d-flex align-items-center">
      <img src="../assets/Logo.png" alt="Logo" class="me-2" style="width: 50px; height: 50px;">
      <h1 class="mb-0">{{ title }}</h1>
    </div>
    <div class="user-info">
      <span class="user-name">{{ pseudo }}</span>
      <button class="btn btn-outline-light btn-sm" @click="logout">
        Déconnexion
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      pseudo: localStorage.getItem('userName') || 'Utilisateur'
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('userName')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  background-color: #ff6600;
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: white;
}
</style>
