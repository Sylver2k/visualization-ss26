<template>
  <v-sheet border rounded="lg" class="pa-4 h-100">
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon icon="mdi-shape-outline" color="primary" />
      <div>
        <div class="text-subtitle-1 font-weight-bold">Shape</div>
        <div class="text-caption text-medium-emphasis">
          {{ attribute }}
        </div>
      </div>
    </div>

    <div class="legend-list">
      <div
        v-for="entry in entries"
        :key="entry.value"
        class="d-flex align-center ga-2 text-body-2"
      >
        <svg class="shape-swatch" viewBox="-8 -8 16 16" aria-hidden="true">
          <path
            :d="entry.path"
            fill="#607d8b"
            stroke="#263238"
            stroke-width="0.8"
          />
        </svg>
        <span class="text-truncate">{{ entry.value }}</span>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { symbol } from "d3";

const props = defineProps<{
  attribute: string;
  rows: DatasetRow[];
}>();

const entries = computed(() =>
  uniqueValues(props.rows, props.attribute).map((value, index) => ({
    value,
    path:
      symbol()
        .type(chartSymbolTypes[index % chartSymbolTypes.length])
        .size(80)() ?? "",
  })),
);

function uniqueValues(rows: DatasetRow[], attribute: string) {
  return [...new Set(rows.map((row) => String(row[attribute] ?? "NA")))];
}
</script>

<style scoped>
.legend-list {
  display: grid;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.shape-swatch {
  flex: 0 0 auto;
  height: 24px;
  width: 24px;
}
</style>
