<template>
  <div class="pa-7">
    <div class="d-flex justify-space-between ga-5 mb-5">
      <div>
        <p class="font-weight-bold">{{ trialLabel }}</p>

        <h3>
          Adjust the second {{ shape }} so it looks {{ targetRatio }} times as
          large as the first.
        </h3>
      </div>

      <v-hover #="{ isHovering, props: hoverProps }">
        <div
          v-bind="hoverProps"
          class="trial-debug-values d-flex align-center flex-grow-1 ga-3 position-relative"
        >
          <div :class="debugValueClasses">
            <span>Current area ratio</span>
            <strong>{{ displayedRatio }}</strong>
          </div>
          <div :class="debugValueClasses">
            <span>Reference size</span>
            <strong>{{ referenceSize.toFixed(0) }} px</strong>
          </div>
          <div :class="debugValueClasses">
            <span>Adjustable size</span>
            <strong>{{ adjustableSize.toFixed(0) }} px</strong>
          </div>
          <v-btn
            v-if="isHovering && blurDebugValues"
            class="trial-debug-values__reveal"
            density="comfortable"
            elevation="3"
            icon
            size="small"
            @click.stop="revealDebugValues"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </div>
      </v-hover>
    </div>

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
  </div>
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
  min-height: 48px;
}

.trial-debug-values__reveal {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.trial-debug-value {
  transition: filter 0.2s ease;
}

.trial-debug-value--blurred {
  filter: blur(6px);
  user-select: none;
}
</style>
