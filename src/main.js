import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { createVuetify } from "vuetify";
import "vuetify/styles";

// const vuetify = createVuetify({
//   theme: {
//     defaultTheme: "light",
//   },
// });

const savedTheme = localStorage.getItem("theme") || "light";

const vuetify = createVuetify({
  theme: {
    defaultTheme: savedTheme,
  },
});

const app = createApp(App);
app.use(createPinia());
app.use(vuetify);
app.use(router);
app.mount("#app");
