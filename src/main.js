import App from "./App.vue";
import Vue from "vue";
import axios from "axios";
import router from "./router";
import store from "./store";

import "./boot/filters.js";
import "./css/app.sass";
import "./plugins/element.js";
import "element-ui/lib/theme-chalk/display.css";
import i18n from "./boot/i18n";

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
