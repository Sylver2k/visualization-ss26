<template>
  <v-container class="py-8">
    <section v-if="!dataset" class="dataset-selection">
      <div class="text-h4 mb-2">Dataset visualization</div>
      <div class="text-body-1 text-medium-emphasis mb-6">
        Select a tab-separated dataset to create a D3.js visualization.
      </div>

      <dataset-picker v-model="datasetFile" />

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-6">
        {{ errorMessage }}
      </v-alert>
    </section>

    <diagram-wrapper
      v-else
      :dataset="dataset"
      :x-attribute="initialAttributes.x"
      :y-attribute="initialAttributes.y"
      :color-attribute="initialAttributes.color"
    />

    <loading-overlay v-model="loading" />
  </v-container>
</template>

<script setup lang="ts">
import type { ParsedDataset } from "../composables/types";

const FAKE_PROCESSING_TIME = 2000;

const datasetFile = ref<File | null>(null);
const dataset = ref<ParsedDataset | null>(null);
const loading = ref(false);
const errorMessage = ref("");

const initialAttributes = computed(() => {
  const columns = dataset.value?.columns ?? [];
  const numericColumns = columns.filter((column) => column.type === "number");
  const categoricalColumn = columns.find((column) => column.type === "string");

  return {
    x: numericColumns[0]?.name ?? columns[0]?.name ?? "",
    y:
      numericColumns[1]?.name ??
      numericColumns[0]?.name ??
      columns[0]?.name ??
      "",
    color: categoricalColumn?.name ?? columns[0]?.name ?? "",
  };
});

watch(datasetFile, async (file) => {
  if (!file) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const [parsedDataset] = await Promise.all([
      parseDatasetFile(file),
      wait(FAKE_PROCESSING_TIME),
    ]);
    dataset.value = parsedDataset;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "The dataset could not be read.";
    datasetFile.value = null;
  } finally {
    loading.value = false;
  }
});

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
</script>

<style scoped>
.dataset-selection {
  margin: 15vh auto 0;
  max-width: 960px;
}
</style>
