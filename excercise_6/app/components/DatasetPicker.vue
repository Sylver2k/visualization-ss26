<template>
  <v-sheet
    class="dataset-picker pa-6 rounded-lg"
    :class="{ 'border-success': selectedDataset }"
    border
  >
    <v-row align="center">
      <v-col cols="auto">
        <v-icon
          :color="selectedDataset ? 'success' : 'primary'"
          :icon="
            selectedDataset ? 'mdi-file-check-outline' : 'mdi-graph-outline'
          "
          size="42"
        />
      </v-col>

      <v-col cols="12" sm>
        <div class="text-subtitle-1 font-weight-bold">
          {{ selectedDataset ? "Dataset selected" : "Select a dataset" }}
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1 text-break">
          {{
            selectedOption?.description ??
            "Choose one of the bundled tab-separated graph datasets."
          }}
        </div>
      </v-col>

      <v-col cols="12" md="5">
        <v-select
          v-model="selectedDataset"
          density="comfortable"
          hide-details="auto"
          item-title="title"
          item-value="value"
          label="Dataset"
          prepend-inner-icon="mdi-table-network"
          variant="outlined"
          :items="datasetOptions"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
type DatasetOption = {
  title: string;
  value: string;
  description: string;
};

const selectedDataset = defineModel<string | null>({ default: null });

const datasetOptions: DatasetOption[] = [
  {
    title: "Bible names connections - small",
    value: "/data/bible_names_connections_small.tsv",
    description:
      "A compact 100-edge subset with varied names and weights for quick testing.",
  },
  {
    title: "Bible names connections - medium",
    value: "/data/bible_names_connections_medium.tsv",
    description:
      "A 1000-edge subset that keeps strong links and adds diverse names from the full dataset.",
  },
  {
    title: "Bible names connections - full",
    value: "/data/bible_name_connections.tsv",
    description:
      "The full Bible name co-occurrence network with 8714 weighted edges.",
  },
];

const selectedOption = computed(() =>
  datasetOptions.find((option) => option.value === selectedDataset.value),
);
</script>

<style scoped>
.dataset-picker {
  border-style: dashed !important;
  border-width: 2px !important;
}
</style>
