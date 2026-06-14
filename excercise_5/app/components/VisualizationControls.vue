<template>
  <v-row class="mb-2" dense>
    <v-col cols="12" sm="6" lg="3">
      <v-select
        v-model="xAttribute"
        :items="numericAttributeOptions"
        density="comfortable"
        hide-details
        label="Position X"
        prepend-inner-icon="mdi-axis-x-arrow"
        variant="outlined"
      />
    </v-col>

    <v-col cols="12" sm="6" lg="3">
      <v-select
        v-model="yAttribute"
        :items="numericAttributeOptions"
        density="comfortable"
        hide-details
        label="Position Y"
        prepend-inner-icon="mdi-axis-y-arrow"
        variant="outlined"
      />
    </v-col>

    <v-col cols="12" sm="6" lg="3">
      <v-select
        v-model="colorAttribute"
        :items="colorAttributeOptions"
        density="comfortable"
        :disabled="colorAttributeOptions.length === 0"
        :hint="colorAttributeHint"
        label="Color"
        persistent-hint
        prepend-inner-icon="mdi-palette-outline"
        variant="outlined"
      />
    </v-col>

    <v-col cols="12" sm="6" lg="3">
      <v-select
        v-model="shapeAttribute"
        :items="shapeAttributeOptions"
        density="comfortable"
        :disabled="shapeAttributeOptions.length === 0"
        :hint="shapeAttributeHint"
        label="Shape"
        persistent-hint
        prepend-inner-icon="mdi-shape-outline"
        variant="outlined"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { getColorAttributes } from "../utils/chartColors";
import {
  chartSymbolCount,
  getShapeAttributes,
} from "../utils/chartSymbols";

const props = defineProps<{
  columns: DatasetColumn[];
  rows: DatasetRow[];
}>();

const xAttribute = defineModel<string>("xAttribute", { required: true });
const yAttribute = defineModel<string>("yAttribute", { required: true });
const colorAttribute = defineModel<string>("colorAttribute", {
  required: true,
});
const shapeAttribute = defineModel<string>("shapeAttribute", {
  required: true,
});

const numericAttributeOptions = computed(() =>
  props.columns
    .filter((column) => column.type === "number")
    .map((column) => ({
      title: column.name,
      value: column.name,
    })),
);

const colorAttributes = computed(() =>
  getColorAttributes(props.columns, props.rows),
);

const colorAttributeOptions = computed(() =>
  colorAttributes.value.map((attribute) => ({
    title:
      attribute.type === "string"
        ? `${attribute.name} (${attribute.distinctValueCount} values)`
        : attribute.name,
    value: attribute.name,
  })),
);

const filteredColorAttributeCount = computed(
  () =>
    props.columns.filter((column) => column.type === "string").length -
    colorAttributes.value.filter((attribute) => attribute.type === "string")
      .length,
);

const colorAttributeHint = computed(() => {
  const count = filteredColorAttributeCount.value;
  return `${count} ${count === 1 ? "attribute was" : "attributes were"} filtered out.`;
});

const shapeAttributes = computed(() =>
  getShapeAttributes(props.columns, props.rows),
);

const shapeAttributeOptions = computed(() =>
  shapeAttributes.value.map((attribute) => ({
    title: `${attribute.name} (${attribute.distinctValueCount} values)`,
    value: attribute.name,
  })),
);

const filteredShapeAttributeCount = computed(
  () => props.columns.length - shapeAttributes.value.length,
);

const shapeAttributeHint = computed(() => {
  if (shapeAttributeOptions.value.length === 0) {
    return `No attributes have between 2 and ${chartSymbolCount} distinct values.`;
  }

  const count = filteredShapeAttributeCount.value;
  return `${count} ${count === 1 ? "attribute was" : "attributes were"} filtered out.`;
});
</script>
