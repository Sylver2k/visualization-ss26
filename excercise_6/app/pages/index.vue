<template>
  <v-container class="py-8">
    <section class="dataset-selection">
      <div class="text-h4 mb-2">Bible network visualization</div>
      <div class="text-body-1 text-medium-emphasis mb-6">
        Select a tab-separated dataset to create a weighted graph.
      </div>

      <dataset-picker v-model="datasetPath" />

      <v-alert v-if="datasetPath" class="mt-6" type="info" variant="tonal">
        Selected dataset: {{ datasetPath }}
      </v-alert>
    </section>
  </v-container>
</template>

<script setup lang="ts">
const datasetPath = ref("/data/bible_names_connections_small.tsv");
</script>

<style scoped>
.dataset-selection {
  margin: 15vh auto 0;
  max-width: 960px;
}
</style>
