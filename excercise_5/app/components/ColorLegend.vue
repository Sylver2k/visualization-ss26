<template>
  <v-sheet border rounded="lg" class="pa-4 h-100">
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon icon="mdi-palette-outline" color="primary" />
      <div>
        <div class="text-subtitle-1 font-weight-bold">Color</div>
        <div class="text-caption text-medium-emphasis">
          {{ attribute }}
        </div>
      </div>
    </div>

    <div v-if="numericLegend">
      <div
        class="color-gradient"
        :style="{ background: numericLegend.gradient }"
      />
      <div
        class="d-flex justify-space-between text-caption text-medium-emphasis mt-1"
      >
        <span>{{ formatNumber(numericLegend.minimum) }}</span>
        <span>{{ formatNumber(numericLegend.maximum) }}</span>
      </div>
      <div
        v-if="numericLegend.hasMissingValues"
        class="d-flex align-center ga-2 mt-3 text-body-2"
      >
        <span
          class="color-swatch"
          :style="{ backgroundColor: missingValueColor }"
        />
        <span>NA</span>
      </div>
    </div>

    <div v-else class="legend-list">
      <div
        v-for="entry in categoricalLegend"
        :key="entry.value"
        class="d-flex align-center ga-2 text-body-2"
      >
        <span class="color-swatch" :style="{ backgroundColor: entry.color }" />
        <span class="text-truncate">{{ entry.value }}</span>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { interpolateViridis, scaleOrdinal, schemeTableau10 } from "d3";

const props = defineProps<{
  attribute: string;
  columnType?: DatasetColumnType;
  rows: DatasetRow[];
  missingValueColor: string;
}>();

const numericLegend = computed(() => {
  if (props.columnType !== "number") {
    return null;
  }

  const values = props.rows
    .map((row) => row[props.attribute])
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return null;
  }

  const gradientStops = Array.from(
    { length: 7 },
    (_, index) => `${interpolateViridis(index / 6)} ${(index / 6) * 100}%`,
  );

  return {
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    gradient: `linear-gradient(90deg, ${gradientStops.join(", ")})`,
    hasMissingValues: props.rows.some(
      (row) => typeof row[props.attribute] !== "number",
    ),
  };
});

const categoricalLegend = computed(() => {
  const colorScale = scaleOrdinal<string, string>(schemeTableau10);

  return uniqueValues(props.rows, props.attribute).map((value) => ({
    value,
    color: colorScale(value),
  }));
});

function uniqueValues(rows: DatasetRow[], attribute: string) {
  return [...new Set(rows.map((row) => String(row[attribute] ?? "NA")))];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}
</script>

<style scoped>
.legend-list {
  display: grid;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.color-gradient {
  border: 1px solid rgba(38, 50, 56, 0.35);
  border-radius: 4px;
  height: 18px;
}

.color-swatch {
  border: 1px solid rgba(38, 50, 56, 0.45);
  border-radius: 50%;
  flex: 0 0 auto;
  height: 16px;
  width: 16px;
}
</style>
