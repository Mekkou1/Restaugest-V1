<template>
    <div class="main-layout">
      <component :is="layout">
        <template v-slot:default>
          <slot></slot>
        </template>
      </component>
      <NotificationWebsocket v-if="isAuthenticated" />
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  import { useStore } from 'vuex'
  import DashboardLayout from '../components/DashboardLayout.vue'
  import NotificationWebsocket from '../components/NotificationWebsocket.vue'
  
  export default {
    name: 'MainLayout',
  
    components: {
      DashboardLayout,
      NotificationWebsocket
    },
  
    setup() {
      const store = useStore()
      const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
      const layout = computed(() => {
        // Use DashboardLayout for authenticated users, default div for others
        return isAuthenticated.value ? 'DashboardLayout' : 'div'
      })
  
      return {
        isAuthenticated,
        layout
      }
    }
  }
  </script>
  
  <style scoped>
  .main-layout {
    min-height: 100vh;
    position: relative;
  }
  </style>
  