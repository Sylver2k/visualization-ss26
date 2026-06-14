<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title>Dataset scatterplot</v-card-title>
      <v-card-subtitle>
        {{ dataset.fileName }}
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text class="pa-4">
      <visualization-controls
        v-model:x-attribute="selectedXAttribute"
        v-model:y-attribute="selectedYAttribute"
        v-model:color-attribute="selectedColorAttribute"
        v-model:shape-attribute="selectedShapeAttribute"
        :columns="dataset.columns"
        :rows="dataset.rows"
      />

      <div class="overflow-x-auto">
        <svg
          ref="chartElement"
          class="diagram"
          role="img"
          :aria-label="`${selectedYAttribute} by ${selectedXAttribute} scatterplot`"
        ></svg>
      </div>

      <v-divider class="my-4" />

      <v-row>
        <v-col cols="12" md="6">
          <color-legend
            :attribute="selectedColorAttribute"
            :column-type="selectedColorColumn?.type"
            :rows="plottedRows"
            :missing-value-color="missingValueColor"
          />
        </v-col>

        <v-col cols="12" md="6">
          <shape-legend
            :attribute="selectedShapeAttribute"
            :rows="plottedRows"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import {
  axisBottom,
  axisLeft,
  extent,
  interpolateViridis,
  scaleLinear,
  scaleOrdinal,
  scaleSequential,
  schemeTableau10,
  select,
  symbol,
} from "d3";
import { getColorAttributes } from "../utils/chartColors";
import {
  chartSymbolTypes,
  getShapeAttributes,
} from "../utils/chartSymbols";

const props = defineProps<{
  dataset: ParsedDataset;
  xAttribute?: string;
  yAttribute?: string;
  colorAttribute?: string;
  shapeAttribute?: string;
}>();

const chartElement = ref<SVGSVGElement | null>(null);
const selectedXAttribute = ref("");
const selectedYAttribute = ref("");
const selectedColorAttribute = ref("");
const selectedShapeAttribute = ref("");

const missingValueColor = "#b0bec5";
const width = 960;
const height = 560;
const margin = {
  top: 24,
  right: 32,
  bottom: 64,
  left: 72,
};

const plottedRows = computed(() => {
  const xAttribute = selectedXAttribute.value;
  const yAttribute = selectedYAttribute.value;

  return props.dataset.rows.filter(
    (row) =>
      typeof row[xAttribute] === "number" &&
      typeof row[yAttribute] === "number",
  );
});

const selectedColorColumn = computed(() =>
  props.dataset.columns.find(
    (column) => column.name === selectedColorAttribute.value,
  ),
);

onMounted(() => {
  initializeSelections();
  drawChart();
});

watch(
  () => props.dataset,
  () => {
    initializeSelections();
    nextTick(drawChart);
  },
  { deep: true },
);

watch(
  [
    selectedXAttribute,
    selectedYAttribute,
    selectedColorAttribute,
    selectedShapeAttribute,
  ],
  drawChart,
);

function initializeSelections() {
  const numericNames = props.dataset.columns
    .filter((column) => column.type === "number")
    .map((column) => column.name);
  const colorNames = getColorAttributes(
    props.dataset.columns,
    props.dataset.rows,
  ).map((column) => column.name);
  const shapeNames = getShapeAttributes(
    props.dataset.columns,
    props.dataset.rows,
  ).map((column) => column.name);

  selectedXAttribute.value = chooseAttribute(
    props.xAttribute,
    numericNames,
    numericNames[0] ?? "",
  );
  selectedYAttribute.value = chooseAttribute(
    props.yAttribute,
    numericNames,
    numericNames[1] ?? numericNames[0] ?? "",
  );
  selectedColorAttribute.value = chooseAttribute(
    props.colorAttribute,
    colorNames,
    colorNames[0] ?? "",
  );
  selectedShapeAttribute.value = chooseAttribute(
    props.shapeAttribute,
    shapeNames,
    shapeNames[0] ?? "",
  );
}

function chooseAttribute(
  requestedAttribute: string | undefined,
  availableAttributes: string[],
  fallback: string,
) {
  return requestedAttribute && availableAttributes.includes(requestedAttribute)
    ? requestedAttribute
    : fallback;
}

function drawChart() {
  if (
    !chartElement.value ||
    !selectedXAttribute.value ||
    !selectedYAttribute.value
  ) {
    return;
  }

  const xAttribute = selectedXAttribute.value;
  const yAttribute = selectedYAttribute.value;
  const colorAttribute = selectedColorAttribute.value;
  const shapeAttribute = selectedShapeAttribute.value;

  const points = plottedRows.value;

  const svg = select(chartElement.value);
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  if (points.length === 0) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("No numeric values are available for these axes.");
    return;
  }

  const xDomain = extent(points, (row) => row[xAttribute] as number) as [
    number,
    number,
  ];
  const yDomain = extent(points, (row) => row[yAttribute] as number) as [
    number,
    number,
  ];

  const xScale = scaleLinear()
    .domain(expandDomain(xDomain))
    .nice()
    .range([margin.left, width - margin.right]);

  const yScale = scaleLinear()
    .domain(expandDomain(yDomain))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const colorFor = createColorAccessor(points, colorAttribute);
  const shapeScale = scaleOrdinal<string, (typeof chartSymbolTypes)[number]>()
    .domain(points.map((row) => String(row[shapeAttribute] ?? "NA")))
    .range(chartSymbolTypes);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(axisBottom(xScale));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(axisLeft(yScale));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 16)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .text(xAttribute);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .text(yAttribute);

  const glyphs = svg
    .append("g")
    .selectAll("path")
    .data(points)
    .join("path")
    .attr(
      "transform",
      (row) =>
        `translate(${xScale(row[xAttribute] as number)}, ${yScale(row[yAttribute] as number)})`,
    )
    .attr("d", (row) =>
      symbol()
        .type(shapeScale(String(row[shapeAttribute] ?? "NA")))
        .size(90)(),
    )
    .attr("fill", colorFor)
    .attr("fill-opacity", 0.76)
    .attr("stroke", "#263238")
    .attr("stroke-width", 0.8);

  glyphs
    .append("title")
    .text((row) =>
      props.dataset.columns
        .map((column) => `${column.name}: ${row[column.name] ?? "NA"}`)
        .join("\n"),
    );
}

function createColorAccessor(
  points: DatasetRow[],
  attribute: string,
): (row: DatasetRow) => string {
  const column = props.dataset.columns.find(
    (datasetColumn) => datasetColumn.name === attribute,
  );

  if (column?.type === "number") {
    const colorDomain = extent(
      points,
      (row) => row[attribute] as number | null,
    ).filter((value): value is number => value !== undefined);

    if (colorDomain.length === 2) {
      const colorScale = scaleSequential(interpolateViridis).domain(
        expandDomain([colorDomain[0], colorDomain[1]]),
      );
      return (row) =>
        typeof row[attribute] === "number"
          ? colorScale(row[attribute])
          : missingValueColor;
    }
  }

  const colorScale = scaleOrdinal<string, string>(schemeTableau10);
  return (row) => colorScale(String(row[attribute] ?? "NA"));
}

function expandDomain([minimum, maximum]: [number, number]): [number, number] {
  if (minimum !== maximum) {
    return [minimum, maximum];
  }

  const padding = Math.abs(minimum * 0.05) || 1;
  return [minimum - padding, maximum + padding];
}
</script>

<style scoped>
.diagram {
  display: block;
  min-width: 640px;
  width: 100%;
}
</style>
