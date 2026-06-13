<template>
  <v-overlay
    v-model="isLoading"
    class="align-center justify-center"
    persistent
  >
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
      width="6"
    />
  </v-overlay>
</template>

<script setup lang="ts">
const isLoading = defineModel<boolean>({ default: false });
</script>
