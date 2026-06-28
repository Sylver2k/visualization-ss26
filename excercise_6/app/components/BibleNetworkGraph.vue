<template>
  <v-card class="network-card" variant="outlined">
    <v-card-item>
      <v-card-title>Bible name network</v-card-title>
      <v-card-subtitle>
        {{ dataset.fileName }} · {{ dataset.nodes.length }} nodes ·
        {{ dataset.links.length }} edges
      </v-card-subtitle>
    </v-card-item>

    <v-divider />

    <v-card-text class="pa-0">
      <svg
        ref="graphElement"
        class="network-graph"
        role="img"
        :aria-label="`${dataset.fileName} force-directed name network`"
      ></svg>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  scaleLinear,
  scaleSqrt,
  select,
} from "d3";
import type { Simulation } from "d3";

const props = defineProps<{
  dataset: ParsedGraphDataset;
}>();

const graphElement = ref<SVGSVGElement | null>(null);
const width = 1100;
const height = 680;

let simulation: Simulation<GraphNode, GraphLink> | null = null;

onMounted(drawGraph);

watch(
  () => props.dataset,
  () => {
    nextTick(drawGraph);
  },
);

onBeforeUnmount(() => {
  simulation?.stop();
});

function drawGraph() {
  if (!graphElement.value) {
    return;
  }

  simulation?.stop();

  const nodes = props.dataset.nodes.map((node) => ({ ...node }));
  const links = props.dataset.links.map((link) => ({
    source: nodeId(link.source),
    target: nodeId(link.target),
    weight: link.weight,
  }));

  const radiusScale = scaleSqrt()
    .domain([props.dataset.minDegree, props.dataset.maxDegree])
    .range([5, 22]);
  const edgeWidthScale = scaleLinear()
    .domain([props.dataset.minWeight, props.dataset.maxWeight])
    .range([0.8, 8]);

  const svg = select(graphElement.value);
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const graphLayer = svg.append("g");

  const linkSelection = graphLayer
    .append("g")
    .attr("stroke", "#90a4ae")
    .attr("stroke-opacity", 0.62)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (link) => edgeWidthScale(link.weight));

  linkSelection
    .append("title")
    .text(
      (link) =>
        `${nodeId(link.source)} - ${nodeId(link.target)}\nWeight: ${link.weight}`,
    );

  const nodeSelection = graphLayer
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (node) => radiusScale(node.degree))
    .attr("fill", "#1976d2")
    .attr("fill-opacity", 0.86)
    .attr("stroke", "#0d47a1")
    .attr("stroke-width", 1.4);

  nodeSelection
    .append("title")
    .text((node) => `${node.name}\nConnections: ${node.degree}`);

  const labelSelection = graphLayer
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 11)
    .attr("fill", "#263238")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("dx", (node) => radiusScale(node.degree) + 4)
    .attr("dy", "0.35em")
    .text((node) => node.name);

  simulation = forceSimulation<GraphNode>(nodes)
    .force(
      "link",
      forceLink<GraphNode, GraphLink>(links)
        .id((node) => node.id)
        .distance(90)
        .strength(0.32),
    )
    .force("charge", forceManyBody().strength(-180))
    .force("center", forceCenter(width / 2, height / 2))
    .force(
      "collision",
      forceCollide<GraphNode>().radius((node) => radiusScale(node.degree) + 5),
    )
    .on("tick", () => {
      linkSelection
        .attr("x1", (link) => nodeX(link.source))
        .attr("y1", (link) => nodeY(link.source))
        .attr("x2", (link) => nodeX(link.target))
        .attr("y2", (link) => nodeY(link.target));

      nodeSelection
        .attr("cx", (node) => node.x ?? width / 2)
        .attr("cy", (node) => node.y ?? height / 2);

      labelSelection
        .attr("x", (node) => node.x ?? width / 2)
        .attr("y", (node) => node.y ?? height / 2);
    });
}

function nodeId(node: string | GraphNode) {
  return typeof node === "string" ? node : node.id;
}

function nodeX(node: string | GraphNode) {
  return typeof node === "string" ? width / 2 : (node.x ?? width / 2);
}

function nodeY(node: string | GraphNode) {
  return typeof node === "string" ? height / 2 : (node.y ?? height / 2);
}
</script>

<style scoped>
.network-graph {
  display: block;
  min-height: 640px;
  width: 100%;
}

.network-card {
  width: 100%;
}
</style>
