<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/Logo.png" alt="Logo" class="logo">
      </div>
      
      <h2 class="text-center mb-4">Connexion</h2>

      <form @submit.prevent="handleLogin" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="pseudo" class="form-label">Pseudo</label>
          <input 
            type="text" 
            class="form-control" 
            id="pseudo"
            v-model="credentials.pseudo"
            :class="{ 'is-invalid': errors.pseudo }"
            required
            autofocus
          >
          <div class="invalid-feedback">{{ errors.pseudo }}</div>
        </div>

        <div class="mb-4">
          <label for="password" class="form-label">Mot de passe</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control" 
              id="password"
              v-model="credentials.mot_de_passe"
              :class="{ 'is-invalid': errors.mot_de_passe }"
              required
            >
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="togglePassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <div class="invalid-feedback">{{ errors.mot_de_passe }}</div>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger mb-4">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Se connecter
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'LoginVue',

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const credentials = ref({
      pseudo: '',
      mot_de_passe: ''
    });

    const showPassword = ref(false);
    const errors = ref({});
    const loading = computed(() => store.state.auth.loading);
    const error = computed(() => store.state.auth.error);

    const validateForm = () => {
      const newErrors = {};
      
      if (!credentials.value.pseudo) {
        newErrors.pseudo = 'Le pseudo est requis';
      }
      
      if (!credentials.value.mot_de_passe) {
        newErrors.mot_de_passe = 'Le mot de passe est requis';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
      if (!validateForm()) return;

      try {
        await store.dispatch('auth/login', credentials.value);
        
        // Redirect to intended destination or home
        const redirectPath = route.query.redirect || '/';
        router.push(redirectPath);
      } catch (error) {
        console.error('Login error:', error);
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      credentials,
      showPassword,
      errors,
      loading,
      error,
      handleLogin,
      togglePassword
    };
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6600 0%, #ff9966 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.form-control:focus {
  border-color: #ff6600;
  box-shadow: 0 0 0 0.2rem rgba(255, 102, 0, 0.25);
}

.btn-primary {
  background-color: #ff6600;
  border-color: #ff6600;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #ff8533;
  border-color: #ff8533;
}

.btn-outline-secondary:focus {
  box-shadow: none;
}

.invalid-feedback {
  display: block;
}

.alert {
  font-size: 0.9rem;
}

@media (max-width: 576px) {
  .login-card {
    margin: 1rem;
    padding: 1.5rem;
  }

  .logo {
    width: 100px;
    height: 100px;
  }
}
</style>
