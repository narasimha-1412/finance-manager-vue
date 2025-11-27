import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

const savedTheme = localStorage.getItem("theme") || "light";

const vuetify = createVuetify({
  theme: {
    defaultTheme: savedTheme,
    themes: {
      light: {
        colors: {
          primary: "rgb(89, 84, 246)",
          error: "rgb(239, 20, 60)",
        },
      },
      dark: {
        colors: {
          primary: "rgb(89, 84, 246)",
          error: "rgb(239, 20, 60)",
        },
      },
    },
  },
  icons: {
    defaultSet: "mdi",
  },
});

const app = createApp(App);
app.use(createPinia());
app.use(vuetify);
app.use(router);
app.mount("#app");
