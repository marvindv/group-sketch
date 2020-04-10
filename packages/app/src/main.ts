import Vue from "vue";
import { BootstrapVue } from "bootstrap-vue";

import "./custom.scss";

import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

Vue.use(BootstrapVue);
