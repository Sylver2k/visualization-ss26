<template>
  <v-container class="py-8" fluid>
    <section class="page-section mb-6">
      <div class="text-h4 mb-2">Bible network visualization</div>
      <div class="text-body-1 text-medium-emphasis mb-6">
        Select a tab-separated dataset to create a weighted graph.
      </div>

      <dataset-picker v-model="datasetPath" />
    </section>

    <v-row v-if="dataset" class="page-section mb-6" dense>
      <v-col cols="12" sm="6" md="3">
        <v-sheet border rounded class="pa-4">
          <div class="text-caption text-medium-emphasis">Nodes</div>
          <div class="text-h5">{{ dataset.nodes.length }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet border rounded class="pa-4">
          <div class="text-caption text-medium-emphasis">Edges</div>
          <div class="text-h5">{{ dataset.links.length }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet border rounded class="pa-4">
          <div class="text-caption text-medium-emphasis">Weight range</div>
          <div class="text-h5">
            {{ dataset.minWeight }} - {{ dataset.maxWeight }}
          </div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet border rounded class="pa-4">
          <div class="text-caption text-medium-emphasis">Degree range</div>
          <div class="text-h5">
            {{ dataset.minDegree }} - {{ dataset.maxDegree }}
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <bible-network-graph v-if="dataset && !loading" :dataset="dataset" />

    <v-overlay
      v-model="loading"
      class="align-center justify-center"
      contained
      persistent
    >
      <v-progress-circular indeterminate size="48" />
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
const datasetPath = ref("/data/bible_names_connections_small.tsv");
const dataset = ref<ParsedGraphDataset | null>(null);
const loading = ref(false);

onMounted(() => {
  watch(datasetPath, loadSelectedDataset, { immediate: true });
});

async function loadSelectedDataset(path: string | null) {
  if (!path) {
    dataset.value = null;
    return;
  }

  loading.value = true;
  dataset.value = await loadGraphDataset(path);
  loading.value = false;
}
</script>

<style scoped>
.page-section {
  margin-inline: auto;
  max-width: 1180px;
}
</style>
