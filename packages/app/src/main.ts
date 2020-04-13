import Vue from "vue";
import { BootstrapVue, ModalPlugin } from "bootstrap-vue";

import "./style.scss";

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
Vue.use(ModalPlugin);
