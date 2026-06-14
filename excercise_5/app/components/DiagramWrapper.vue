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
            :rows="dataset.rows"
            :missing-value-color="missingValueColor"
          />
        </v-col>

        <v-col cols="12" md="6">
          <shape-legend
            :attribute="selectedShapeAttribute"
            :rows="dataset.rows"
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
import { chartSymbolTypes, getShapeAttributes } from "../utils/chartSymbols";

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
const missingBandSize = 58;
const missingBandGap = 14;
const margin = {
  top: 24,
  right: 32,
  bottom: 64,
  left: 72,
};

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

  const points = props.dataset.rows;
  const numericXValues = points
    .map((row) => row[xAttribute])
    .filter((value): value is number => typeof value === "number");
  const numericYValues = points
    .map((row) => row[yAttribute])
    .filter((value): value is number => typeof value === "number");

  const svg = select(chartElement.value);
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  if (numericXValues.length === 0 && numericYValues.length === 0) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("No numeric values are available for either axis.");
    return;
  }

  const xDomain = numericDomain(numericXValues);
  const yDomain = numericDomain(numericYValues);
  const plotRight = width - margin.right - missingBandGap - missingBandSize;
  const plotBottom = height - margin.bottom - missingBandGap - missingBandSize;
  const missingXPosition = plotRight + missingBandGap + missingBandSize / 2;
  const missingYPosition = plotBottom + missingBandGap + missingBandSize / 2;

  const xScale = scaleLinear()
    .domain(expandDomain(xDomain))
    .nice()
    .range([margin.left, plotRight]);

  const yScale = scaleLinear()
    .domain(expandDomain(yDomain))
    .nice()
    .range([plotBottom, margin.top]);

  const colorFor = createColorAccessor(points, colorAttribute);
  const shapeScale = scaleOrdinal<string, (typeof chartSymbolTypes)[number]>()
    .domain(points.map((row) => String(row[shapeAttribute] ?? "NA")))
    .range(chartSymbolTypes);

  svg
    .append("rect")
    .attr("x", plotRight + missingBandGap)
    .attr("y", margin.top)
    .attr("width", missingBandSize)
    .attr("height", plotBottom - margin.top)
    .attr("fill", "#f5f7fa")
    .attr("stroke", "#cbd5e1")
    .attr("stroke-dasharray", "4 4");

  svg
    .append("rect")
    .attr("x", margin.left)
    .attr("y", plotBottom + missingBandGap)
    .attr("width", plotRight - margin.left)
    .attr("height", missingBandSize)
    .attr("fill", "#f5f7fa")
    .attr("stroke", "#cbd5e1")
    .attr("stroke-dasharray", "4 4");

  svg
    .append("rect")
    .attr("x", plotRight + missingBandGap)
    .attr("y", plotBottom + missingBandGap)
    .attr("width", missingBandSize)
    .attr("height", missingBandSize)
    .attr("fill", "#eceff3")
    .attr("stroke", "#cbd5e1")
    .attr("stroke-dasharray", "4 4");

  svg
    .append("g")
    .attr("transform", `translate(0, ${plotBottom})`)
    .call(axisBottom(xScale));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(axisLeft(yScale));

  svg
    .append("text")
    .attr("x", missingXPosition)
    .attr("y", plotBottom + 20)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .attr("font-size", 12)
    .text("NA");

  svg
    .append("text")
    .attr("x", margin.left - 12)
    .attr("y", missingYPosition + 4)
    .attr("text-anchor", "end")
    .attr("fill", "currentColor")
    .attr("font-size", 12)
    .text("NA");

  svg
    .append("text")
    .attr("x", (margin.left + plotRight) / 2)
    .attr("y", height - 16)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .text(xAttribute);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + plotBottom) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .text(yAttribute);

  const glyphs = svg
    .append("g")
    .selectAll("path")
    .data(points)
    .join("path")
    .attr("transform", (row, index) => {
      const xValue = row[xAttribute];
      const yValue = row[yAttribute];
      const x =
        typeof xValue === "number"
          ? xScale(xValue)
          : missingXPosition + jitter(index, 0);
      const y =
        typeof yValue === "number"
          ? yScale(yValue)
          : missingYPosition + jitter(index, 1);

      return `translate(${x}, ${y})`;
    })
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

function numericDomain(values: number[]): [number, number] {
  if (values.length === 0) {
    return [0, 1];
  }

  return extent(values) as [number, number];
}

function jitter(index: number, offset: number) {
  const spread = missingBandSize / 2 - 8;
  const normalized = ((index * 37 + offset * 17) % 101) / 100;
  return (normalized * 2 - 1) * spread;
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
