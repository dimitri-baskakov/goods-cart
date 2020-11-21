import App from "./App.vue";
import Vue from "vue";
import router from "./router";
import store from "./store";

import "./boot/filters.js";
import "./css/app.sass";
import "./plugins/element.js";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
