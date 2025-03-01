<template>
  <div class="container-fluid bg-orange vh-100">
    <!-- Logo et titre en haut -->
    <div class="text-center pt-3">
      <div class="d-flex align-items-center justify-content-center">
        <img src="../assets/Restaugest.png" alt="Restau Logo" class="logo me-2" style="width: 70px; height: auto;">
        <h1 class="text-white">Bienvenue sur RestauGest</h1>
      </div>
    </div>

    <div class="container h-100 d-flex align-items-center justify-content-center">
      <div class="row justify-content-center w-100">
        <!-- Logo et slogan -->
        <div class="col-md-6 text-center mb-4 d-flex align-items-center justify-content-center">
          <img src="../assets/Logo.png" alt="Menu Ivoire Logo" class="img-fluid" />
        </div>

        <!-- Formulaire de connexion -->
        <div class="col-md-6">

          <div class="card shadow p-4">
            <h1 class="text-center text-uppercase fw-bold">Connexion</h1>
            <form @submit.prevent="seConnecter">
              <div class="mb-3">
                <label for="pseudo" class="form-label">Pseudo :</label>
                <input v-model="credentials.pseudo" type="text" id="pseudo" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="mot_de_passe" class="form-label">Mot de passe :</label>
                <input v-model="credentials.mot_de_passe" type="password" id="mot_de_passe" class="form-control" required />
              </div>

              <div class="form-check mb-3">
                <input type="checkbox" id="remember" class="form-check-input" v-model="rememberMe" />
                <label for="remember" class="form-check-label">Se souvenir de moi</label>
              </div>

              <p class="text-end">
                <a href="#" class="text-decoration-none text-primary">Mot de passe oublié ?</a>
              </p>

              <button type="submit" class="btn btn-dark w-100">Se connecter</button>
            </form>

            <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      credentials: {
        pseudo: '',
        mot_de_passe: ''
      },
      rememberMe: false,
      error: null,
      loading: false
    };
  },
  methods: {
    async seConnecter() {
      console.log('Login attempt started');
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Dispatching login action with credentials:', this.credentials);
        const response = await this.$store.dispatch('login', this.credentials);
        console.log('Login successful, response:', response);

        if (this.rememberMe) {
          console.log('Remember me enabled, storing credentials');
          localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to dashboard which will handle role-specific routing
        console.log('Redirecting to dashboard');
        this.$router.push('/dashboard');


      } catch (error) {
        console.error('Login failed:', error);
        this.error = error.message || 'Erreur lors de la connexion';
      } finally {
        this.loading = false;
        console.log('Login attempt completed');
      }
    }
  }
};
</script>

<style scoped>
/* Fond orange sur toute la page */
.bg-orange {
  background-color: #ff6600;
}
.img-fluid {
  max-width: 250px;
}
/* Ajustement du logo */
.logo {
  max-width: 70px;
  height: auto;
}

/* Carte de connexion */
.card {
  border-radius: 8px;
}

/* Bouton connexion */
.btn-dark {
  background: black;
}

.btn-dark:hover {
  background: #333;
}

/* Titre principal */
h1.text-white {
  font-size: 2rem;
  margin: 0;
}
</style>
