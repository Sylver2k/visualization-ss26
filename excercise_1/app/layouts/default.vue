<template>
  <v-app>
    <v-main class="app-shell">
      <div class="app-shell__aurora app-shell__aurora--left" />
      <div class="app-shell__aurora app-shell__aurora--right" />

      <v-container class="app-shell__container py-8 py-md-12" max-width="1280">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
