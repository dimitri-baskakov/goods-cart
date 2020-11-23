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
  -moz-osx-font-smoothing: grayscale
  -webkit-font-smoothing: antialiased
  color: #2c3e50
  font-family: "Avenir", Helvetica, Arial, sans-serif
  margin: 0 auto
  max-width: 1900px
  padding: 50px 0
  text-align: center

.nav
  margin-bottom: 40px
</style>
