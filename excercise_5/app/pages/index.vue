<template>
  <v-container class="py-8">
    <div class="text-h4 mb-2">Dataset visualization</div>
    <div class="text-body-1 text-medium-emphasis mb-6">
      Upload a TSV dataset or explore the included German vehicle dataset.
    </div>

    <dataset-picker v-model="datasetFile" class="mb-6" />

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <diagram-wrapper v-if="dataset" :dataset="dataset" />

    <loading-overlay v-model="loading" />
  </v-container>
</template>

<script setup lang="ts">
import type { ParsedDataset } from "../composables/types";

const datasetFile = ref<File | null>(null);
const dataset = ref<ParsedDataset | null>(null);
const loading = ref(false);
const errorMessage = ref("");

onMounted(loadDefaultDataset);

watch(datasetFile, async (file) => {
  if (!file) {
    return;
  }

  await loadDataset(() => parseDatasetFile(file));
});

async function loadDefaultDataset() {
  await loadDataset(async () => {
    const tsv = await $fetch<string>("/data/carsDE.tsv", {
      responseType: "text",
    });
    return parseDatasetTsv(tsv, "carsDE.tsv");
  });
}

async function loadDataset(loader: () => Promise<ParsedDataset>) {
  loading.value = true;
  errorMessage.value = "";

  try {
    dataset.value = await loader();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "The dataset could not be read.";
  } finally {
    loading.value = false;
  }
}
</script>
