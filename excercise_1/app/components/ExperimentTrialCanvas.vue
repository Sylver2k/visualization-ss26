<template>
  <v-card class="glass-card" rounded="xlarge">
    <v-card-text class="pa-5 pa-md-7 d-flex flex-column ga-5">
      <div class="d-flex flex-wrap align-start justify-space-between ga-5">
        <div>
          <div class="section-kicker mb-2">{{ trialLabel }}</div>
          <h3 class="text-h5 font-weight-bold mb-2">
            Adjust the second {{ shape }} so it looks {{ targetRatio }} times as
            large as the first
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Compare the fixed reference on the left with the adjustable shape on
            the right, then drag the handle until the perceptual match feels correct.
          </p>
        </div>

        <v-hover #="{ isHovering, props: hoverProps }">
          <div
            v-bind="hoverProps"
            class="trial-debug-values d-flex flex-wrap justify-end ga-3 position-relative"
          >
            <v-sheet
              v-for="metric in metrics"
              :key="metric.label"
              :class="debugValueClasses"
              class="metric-card pa-4"
              min-width="150"
              rounded="xl"
            >
              <div class="text-caption text-medium-emphasis mb-1">
                {{ metric.label }}
              </div>
              <strong class="text-subtitle-1">{{ metric.value }}</strong>
            </v-sheet>

            <v-fade-transition>
              <v-btn
                v-if="isHovering && blurDebugValues"
                class="trial-debug-values__reveal"
                color="primary"
                density="comfortable"
                elevation="3"
                icon
                size="small"
                @click.stop="revealDebugValues"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </v-fade-transition>
          </div>
        </v-hover>
      </div>

      <v-sheet class="canvas-panel pa-3 pa-md-4" rounded="xlarge">
        <svg
          ref="svgRef"
          class="trial-canvas__svg"
          :viewBox="`0 0 ${width} ${height}`"
          role="img"
          :aria-label="`Resize the second ${shape} to match the requested perceived ratio.`"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerUp"
        >
          <line x1="400" y1="36" x2="400" y2="324" class="trial-canvas__divider" />

          <text x="220" y="38" text-anchor="middle" class="trial-canvas__label">
            Reference
          </text>
          <text x="580" y="38" text-anchor="middle" class="trial-canvas__label">
            Adjustable
          </text>

          <template v-if="shape === 'circle'">
            <circle
              :cx="leftCenter.x"
              :cy="leftCenter.y"
              :r="referenceSize"
              class="trial-canvas__shape trial-canvas__shape--reference"
            />
            <circle
              :cx="rightCenter.x"
              :cy="rightCenter.y"
              :r="adjustableSize"
              class="trial-canvas__shape trial-canvas__shape--adjustable"
            />
          </template>

          <template v-else>
            <rect
              :x="leftCenter.x - referenceSize"
              :y="leftCenter.y - referenceSize"
              :width="referenceSize * 2"
              :height="referenceSize * 2"
              rx="10"
              class="trial-canvas__shape trial-canvas__shape--reference"
            />
            <rect
              :x="rightCenter.x - adjustableSize"
              :y="rightCenter.y - adjustableSize"
              :width="adjustableSize * 2"
              :height="adjustableSize * 2"
              rx="10"
              class="trial-canvas__shape trial-canvas__shape--adjustable"
            />
          </template>

          <line
            :x1="rightCenter.x"
            :y1="rightCenter.y"
            :x2="currentHandlePosition.x"
            :y2="currentHandlePosition.y"
            class="trial-canvas__handle-line"
          />

          <circle
            :cx="currentHandlePosition.x"
            :cy="currentHandlePosition.y"
            r="12"
            class="trial-canvas__handle"
            @pointerdown="onPointerDown"
          />

          <text
            :x="currentHandlePosition.x"
            :y="currentHandlePosition.y - 18"
            text-anchor="middle"
            class="trial-canvas__drag-text"
          >
            Drag
          </text>
        </svg>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  shape: "circle" | "square";
  referenceSize: number;
  adjustableSize: number;
  targetRatio: number;
  trialLabel: string;
}>();

const emit = defineEmits<{
  "update:adjustableSize": [value: number];
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const dragging = ref(false);
const blurDebugValues = ref(true);

const width = 800;
const height = 360;
const leftCenter = { x: 220, y: 180 };
const rightCenter = { x: 580, y: 180 };
const minSize = 48;
const maxSize = 176;
const circleHandleAngle = -Math.PI / 4;

const displayedRatio = computed(() => {
  const ratio = computeAreaRatio(props.adjustableSize, props.referenceSize);
  return ratio.toFixed(3);
});

const trialIdentity = computed(
  () => `${props.shape}-${props.targetRatio}-${props.trialLabel}`,
);

const debugValueClasses = computed(() => ({
  "trial-debug-value": true,
  "trial-debug-value--blurred": blurDebugValues.value,
}));
const metrics = computed(() => [
  {
    label: "Current area ratio",
    value: displayedRatio.value,
  },
  {
    label: "Reference size",
    value: `${props.referenceSize.toFixed(0)} px`,
  },
  {
    label: "Adjustable size",
    value: `${props.adjustableSize.toFixed(0)} px`,
  },
]);

watch(trialIdentity, () => {
  blurDebugValues.value = true;
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function computeAreaRatio(adjustable: number, reference: number) {
  return (adjustable * adjustable) / (reference * reference);
}

function handlePosition(size: number) {
  if (props.shape === "circle") {
    return {
      x: rightCenter.x + Math.cos(circleHandleAngle) * size,
      y: rightCenter.y + Math.sin(circleHandleAngle) * size,
    };
  }

  return {
    x: rightCenter.x + size,
    y: rightCenter.y - size,
  };
}

function revealDebugValues() {
  blurDebugValues.value = false;
}

function updateFromPointer(clientX: number, clientY: number) {
  if (!svgRef.value) {
    return;
  }

  // Translate into SVG's coodinate system
  const bounds = svgRef.value.getBoundingClientRect();
  const x = ((clientX - bounds.left) / bounds.width) * width;
  const y = ((clientY - bounds.top) / bounds.height) * height;

  let nextSize = props.adjustableSize;

  if (props.shape === "circle") {
    // Euclidean distance
    const dx = x - rightCenter.x;
    const dy = y - rightCenter.y;
    nextSize = Math.sqrt(dx * dx + dy * dy);
  } else {
    nextSize = Math.max(
      Math.abs(x - rightCenter.x),
      Math.abs(y - rightCenter.y),
    );
  }

  emit("update:adjustableSize", clamp(nextSize, minSize, maxSize));
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true;
  const target = event.currentTarget as HTMLElement | null;
  target?.setPointerCapture(event.pointerId);
  updateFromPointer(event.clientX, event.clientY);
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) {
    return;
  }

  updateFromPointer(event.clientX, event.clientY);
}

function onPointerUp(event: PointerEvent) {
  dragging.value = false;
  const target = event.currentTarget as HTMLElement | null;
  target?.releasePointerCapture(event.pointerId);
}

const currentHandlePosition = computed(() =>
  handlePosition(props.adjustableSize),
);
</script>

<style scoped>
.trial-debug-values {
  min-height: 56px;
}

.trial-debug-values__reveal {
  position: absolute;
  right: 8px;
  top: -8px;
}

.trial-debug-value {
  transition: filter 0.2s ease;
}

.trial-debug-value--blurred {
  filter: blur(6px);
  user-select: none;
}

.canvas-panel {
  background:
    linear-gradient(180deg, rgba(9, 19, 26, 0.92), rgba(11, 21, 29, 0.98));
  border: 1px solid rgba(230, 241, 244, 0.08);
}

.trial-canvas__svg {
  display: block;
  height: auto;
  max-width: 100%;
}

.trial-canvas__divider,
.trial-canvas__handle-line {
  stroke: rgba(230, 241, 244, 0.18);
  stroke-width: 2;
}

.trial-canvas__label,
.trial-canvas__drag-text {
  fill: rgba(230, 241, 244, 0.82);
  font-size: 14px;
}

.trial-canvas__shape--reference {
  fill: rgba(125, 211, 252, 0.32);
  stroke: rgba(125, 211, 252, 0.88);
  stroke-width: 3;
}

.trial-canvas__shape--adjustable {
  fill: rgba(61, 217, 193, 0.18);
  stroke: rgba(61, 217, 193, 0.95);
  stroke-width: 3;
}

.trial-canvas__handle {
  cursor: grab;
  fill: rgba(61, 217, 193, 1);
  stroke: rgba(9, 19, 26, 0.9);
  stroke-width: 3;
}

.trial-canvas__handle:active {
  cursor: grabbing;
}
</style>
