import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "experimentDark",
      themes: {
        experimentDark: {
          dark: true,
          colors: {
            background: "#09131A",
            surface: "#0F1B24",
            "surface-bright": "#1A2B36",
            "surface-light": "#13232E",
            "surface-variant": "#18303A",
            primary: "#3DD9C1",
            secondary: "#7DD3FC",
            accent: "#5EEAD4",
            success: "#34D399",
            warning: "#FBBF24",
            error: "#F87171",
            info: "#38BDF8",
            "on-background": "#E6F1F4",
            "on-surface": "#E6F1F4",
            "on-primary": "#06211E",
            "on-secondary": "#082033",
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
