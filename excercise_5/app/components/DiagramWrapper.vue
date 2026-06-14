<template>
  <v-card variant="outlined">
    <v-card-item>
      <v-card-title>Vehicle scatterplot</v-card-title>
      <v-card-subtitle>
        {{ xAttribute }} and {{ yAttribute }}, colored by {{ colorAttribute }}
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text class="pa-2 pa-sm-4 overflow-x-auto">
      <svg
        ref="chartElement"
        class="diagram"
        role="img"
        :aria-label="`${yAttribute} by ${xAttribute} scatterplot`"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import {
  axisBottom,
  axisLeft,
  extent,
  scaleLinear,
  scaleOrdinal,
  schemeTableau10,
  select,
} from "d3";
import type { ParsedDataset } from "../composables/types";

const props = withDefaults(
  defineProps<{
    dataset: ParsedDataset;
    xAttribute?: string;
    yAttribute?: string;
    colorAttribute?: string;
  }>(),
  {
    xAttribute: "Gewicht",
    yAttribute: "Verbrauch",
    colorAttribute: "Herkunft",
  },
);

const chartElement = ref<SVGSVGElement | null>(null);

const width = 960;
const height = 560;
const margin = {
  top: 24,
  right: 32,
  bottom: 64,
  left: 72,
};

onMounted(drawChart);

watch(
  () => [
    props.dataset,
    props.xAttribute,
    props.yAttribute,
    props.colorAttribute,
  ],
  drawChart,
  { deep: true },
);

function drawChart() {
  if (!chartElement.value) {
    return;
  }

  const points = props.dataset.rows.filter(
    (row) =>
      typeof row[props.xAttribute] === "number" &&
      typeof row[props.yAttribute] === "number",
  );

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

  const xDomain = extent(points, (row) => row[props.xAttribute] as number) as [
    number,
    number,
  ];
  const yDomain = extent(points, (row) => row[props.yAttribute] as number) as [
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

  const colorScale = scaleOrdinal<string, string>(schemeTableau10);

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
    .text(props.xAttribute);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "currentColor")
    .text(props.yAttribute);

  const glyphs = svg
    .append("g")
    .selectAll("circle")
    .data(points)
    .join("circle")
    .attr("cx", (row) => xScale(row[props.xAttribute] as number))
    .attr("cy", (row) => yScale(row[props.yAttribute] as number))
    .attr("r", 5)
    .attr("fill", (row) =>
      colorScale(String(row[props.colorAttribute] ?? "NA")),
    )
    .attr("fill-opacity", 0.72)
    .attr("stroke", "#263238")
    .attr("stroke-width", 0.7);

  glyphs
    .append("title")
    .text((row) =>
      props.dataset.columns
        .map((column) => `${column.name}: ${row[column.name] ?? "NA"}`)
        .join("\n"),
    );
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
