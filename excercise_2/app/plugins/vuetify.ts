import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "clinicalLight",
      themes: {
        clinicalLight: {
          dark: false,
          colors: {
            background: "#f5f8fb",
            surface: "#ffffff",
            "surface-bright": "#ffffff",
            "surface-light": "#f8fbfd",
            "surface-variant": "#e7eef5",
            primary: "#2563eb",
            secondary: "#0f9f9a",
            success: "#16a34a",
            error: "#dc2626",
            info: "#0284c7",
            warning: "#d97706",
            "on-background": "#172033",
            "on-surface": "#172033",
            "on-surface-variant": "#526173",
            "on-primary": "#ffffff",
            "on-secondary": "#ffffff",
          },
          variables: {
            "border-color": "#d8e2ec",
            "border-opacity": 1,
            "high-emphasis-opacity": 0.92,
            "medium-emphasis-opacity": 0.72,
          },
        },
      },
    },
    components: {
      ...components,
    },
    directives,
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },
  });
  app.vueApp.use(vuetify);
});
