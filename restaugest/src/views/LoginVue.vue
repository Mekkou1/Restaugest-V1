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
            <h1 class="text-center text-uppercase fw-bold mb-4">Connexion</h1>
            
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="pseudo" class="form-label">Pseudo :</label>
                <input 
                  v-model="credentials.pseudo"
                  type="text" 
                  id="pseudo" 
                  class="form-control" 
                  required 
                  :disabled="loading"
                  autocomplete="username"
                />
              </div>

              <div class="mb-3">
                <label for="mot_de_passe" class="form-label">Mot de passe :</label>
                <input 
                  v-model="credentials.mot_de_passe"
                  type="password" 
                  id="mot_de_passe" 
                  class="form-control" 
                  required 
                  :disabled="loading"
                  autocomplete="current-password"
                />
              </div>

              <div class="form-check mb-3">
                <input 
                  type="checkbox" 
                  id="remember" 
                  class="form-check-input" 
                  v-model="rememberMe"
                  :disabled="loading"
                />
                <label for="remember" class="form-check-label">Se souvenir de moi</label>
              </div>

              <button 
                type="submit" 
                class="btn btn-dark w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'LoginVue',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const credentials = reactive({
      pseudo: '',
      mot_de_passe: ''
    });
    
    const loading = ref(false);
    const error = ref(null);
    const rememberMe = ref(false);

    const handleLogin = async () => {
      loading.value = true;
      error.value = null;

      try {
        await store.dispatch('login', {
          ...credentials,
          rememberMe: rememberMe.value
        });

        // Redirect to the intended route or dashboard
        const redirectPath = route.query.redirect || '/dashboard';
        router.push(redirectPath);
      } catch (err) {
        console.error('Login error:', err);
        error.value = err.message || 'Erreur lors de la connexion';
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      loading,
      error,
      rememberMe,
      handleLogin
    };
  }
};
</script>

<style scoped>
.bg-orange {
  background-color: #ff6600;
}

.img-fluid {
  max-width: 250px;
}

.logo {
  max-width: 70px;
  height: auto;
}

.card {
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.95);
}

.btn-dark {
  background: black;
  transition: all 0.3s ease;
}

.btn-dark:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
}

.btn-dark:disabled {
  background: #666;
  cursor: not-allowed;
}

h1.text-white {
  font-size: 2rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.form-control:focus {
  border-color: #ff6600;
  box-shadow: 0 0 0 0.2rem rgba(255, 102, 0, 0.25);
}

.alert {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card {
    margin: 1rem;
  }
  
  h1.text-white {
    font-size: 1.5rem;
  }
}
</style>
