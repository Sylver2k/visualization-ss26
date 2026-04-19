<template>
  <div>
    <v-card class="pa-4 mb-4">
      <div>Visualization SS26 - Excercise 1</div>

      <div>Perceived Area Experiment</div>

      <div>
        This study estimates the perception exponent <b>x</b> for circles and
        squares by asking participants to resize a second shape until it appears
        to match a target ratio.
      </div>
    </v-card>

    <v-card class="pa-4 mb-4">
      <stage-indicator v-model="stage" @set-stage="stage = $event" />
    </v-card>

    <stages-container v-model="stage" />
  </div>
</template>

<script setup lang="ts">
const stage = ref("INTRO");
</script>

<style scoped></style>
