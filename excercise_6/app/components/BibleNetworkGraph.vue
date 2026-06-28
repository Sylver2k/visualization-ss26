<template>
  <v-card class="network-card" variant="outlined">
    <v-row>
      <v-col cols="4">
        <v-card-title>Bible name network</v-card-title>
        <v-card-subtitle>
          {{ dataset.fileName }} · {{ dataset.nodes.length }} nodes ·
          {{ dataset.links.length }} edges
        </v-card-subtitle>
      </v-col>

      <v-spacer />

      <v-col cols="5">
        <div class="d-flex flex-grow-1 align-center ga-4 py-2 pr-4">
          <v-text-field
            v-model="searchQuery"
            clearable
            density="comfortable"
            hide-details
            label="Search person"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
          />

          <div class="text-body-2 text-medium-emphasis">
            {{ searchSummary }}
          </div>
        </div>
      </v-col>
    </v-row>

    <div class="d-flex align-center justify-space-between">
      <div class="mr-16"></div>
    </div>

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
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  scaleLinear,
  scaleSqrt,
  select,
  zoom,
} from "d3";
import type { D3DragEvent, D3ZoomEvent, Simulation } from "d3";

const props = defineProps<{
  dataset: ParsedGraphDataset;
}>();

const graphElement = ref<SVGSVGElement | null>(null);
const searchQuery = ref("");
const width = 1100;
const height = 680;

let simulation: Simulation<GraphNode, GraphLink> | null = null;

const matchingNodeNames = computed(() => {
  const query = normalizedSearchQuery();

  if (!query) {
    return new Set<string>();
  }

  return new Set(
    props.dataset.nodes
      .filter((node) => node.name.toLowerCase().includes(query))
      .map((node) => node.name),
  );
});

const searchSummary = computed(() => {
  if (!normalizedSearchQuery()) {
    return "No search active";
  }

  const count = matchingNodeNames.value.size;
  return `${count} matching ${count === 1 ? "person" : "people"}`;
});

onMounted(drawGraph);

watch(
  () => props.dataset,
  () => {
    nextTick(drawGraph);
  },
);

watch(searchQuery, applySearchHighlight);

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

  svg.call(
    zoom<SVGSVGElement, unknown>().on(
      "zoom",
      (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        graphLayer.attr("transform", event.transform.toString());
      },
    ),
  );

  const linkSelection = graphLayer
    .append("g")
    .attr("stroke", "#90a4ae")
    .attr("stroke-opacity", 0.62)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("class", "network-link")
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
    .attr("class", "network-node")
    .attr("r", (node) => radiusScale(node.degree))
    .attr("fill", "#1976d2")
    .attr("fill-opacity", 0.86)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1.4)
    .call(
      drag<SVGCircleElement, GraphNode>()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded),
    );

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
    .attr("class", "network-label")
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

  applySearchHighlight();
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

function applySearchHighlight() {
  if (!graphElement.value) {
    return;
  }

  const matchedNames = matchingNodeNames.value;
  const hasSearch = normalizedSearchQuery().length > 0;
  const svg = select(graphElement.value);

  svg
    .selectAll<SVGCircleElement, GraphNode>(".network-node")
    .attr("fill", (node) =>
      isMatchedNode(node, matchedNames) ? "#ff9800" : "#1976d2",
    )
    .attr("fill-opacity", (node) =>
      !hasSearch || isMatchedNode(node, matchedNames) ? 0.86 : 0.16,
    );

  svg
    .selectAll<SVGLineElement, GraphLink>(".network-link")
    .attr("stroke", (link) =>
      hasSearch && isRelatedLink(link, matchedNames) ? "#ff9800" : "#90a4ae",
    )
    .attr("stroke-opacity", (link) =>
      !hasSearch || isRelatedLink(link, matchedNames) ? 0.62 : 0.06,
    );

  svg
    .selectAll<SVGTextElement, GraphNode>(".network-label")
    .attr("fill", (node) =>
      isMatchedNode(node, matchedNames) ? "#000000" : "#263238",
    )
    .attr("font-weight", (node) =>
      isMatchedNode(node, matchedNames) ? 700 : 400,
    )
    .attr("opacity", (node) =>
      !hasSearch || isMatchedNode(node, matchedNames) ? 1 : 0.26,
    );
}

function isMatchedNode(node: GraphNode, matchedNames: Set<string>) {
  return matchedNames.has(node.name);
}

function isRelatedLink(link: GraphLink, matchedNames: Set<string>) {
  return (
    matchedNames.has(nodeId(link.source)) ||
    matchedNames.has(nodeId(link.target))
  );
}

function normalizedSearchQuery() {
  return searchQuery.value.trim().toLowerCase();
}

function dragStarted(
  event: D3DragEvent<SVGCircleElement, GraphNode, GraphNode>,
  node: GraphNode,
) {
  if (!event.active) {
    simulation?.alphaTarget(0.3).restart();
  }

  node.fx = node.x;
  node.fy = node.y;
}

function dragged(
  event: D3DragEvent<SVGCircleElement, GraphNode, GraphNode>,
  node: GraphNode,
) {
  node.fx = event.x;
  node.fy = event.y;
}

function dragEnded(
  event: D3DragEvent<SVGCircleElement, GraphNode, GraphNode>,
  node: GraphNode,
) {
  if (!event.active) {
    simulation?.alphaTarget(0);
  }

  node.fx = null;
  node.fy = null;
}
</script>

<style scoped>
.network-graph {
  display: block;
  min-height: 640px;
  touch-action: none;
  width: 100%;
}

.network-card {
  width: 100%;
}

:deep(.network-label) {
  pointer-events: none;
  user-select: none;
}
</style>
