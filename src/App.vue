<template>
  <div id="app">
    <div class="nav">
      <router-link to="/">Главная</router-link> |
      <router-link to="/about">О проекте</router-link>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>

<style lang="sass">
#app
  font-family: "Avenir", Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  margin-top: 60px

.nav
  margin-bottom: 40px
</style>
