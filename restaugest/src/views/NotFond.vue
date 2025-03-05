<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <!-- Illustration d'erreur 404 -->
        <div class="mb-8">
          <i class="fas fa-exclamation-triangle text-8xl text-primary-600"></i>
        </div>
  
        <!-- Message d'erreur -->
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
  
        <!-- Actions -->
        <div class="space-y-4">
          <button 
            @click="$router.go(-1)"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mx-2"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Retour
          </button>
  
          <router-link 
            to="/"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mx-2"
          >
            <i class="fas fa-home mr-2"></i>
            Accueil
          </router-link>
        </div>
  
        <!-- Suggestions -->
        <div class="mt-12">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Vous pouvez essayer :
          </h2>
          <ul class="text-gray-600 space-y-2">
            <li>
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              Vérifier l'URL pour les erreurs de frappe
            </li>
            <li>
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              Retourner à la page précédente
            </li>
            <li>
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              Naviguer vers la page d'accueil
            </li>
          </ul>
        </div>
  
        <!-- Support -->
        <div class="mt-12 text-gray-600">
          <p>
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support :
          </p>
          <a 
            href="mailto:support@restaugest.com"
            class="text-primary-600 hover:text-primary-700 font-medium"
          >
            <i class="fas fa-envelope mr-1"></i>
            support@restaugest.com
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound',
  
    mounted() {
      // Log 404 error for analytics
      if (process.env.NODE_ENV === 'production') {
        console.error('404 error:', window.location.pathname);
      }
    }
  };
  </script>
  
  <style scoped>
  .notification-enter-active,
  .notification-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .notification-enter-from,
  .notification-leave-to {
    opacity: 0;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(-5%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
  
  .fa-exclamation-triangle {
    animation: bounce 2s infinite;
  }
  </style>
  