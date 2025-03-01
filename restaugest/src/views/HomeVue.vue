<template>
  <div class="conect vh-100 d-flex flex-column justify-content-center align-items-center">
    <LoginVue />
  </div>
</template>

<script>
import LoginVue from './LoginVue.vue';

export default {
  name: 'HomeVue',
  components: { LoginVue },
 
};
</script>

<style>
body {
  background-color: #ff6600;
  margin: 0;
  font-family: Arial, sans-serif;
  height: 100%;
}

html {
  height: 100%;
}

.conect {
  height: 100%;
}

h1 {
  font-family: Arial, sans-serif;
  padding: 20px;
}
</style>
