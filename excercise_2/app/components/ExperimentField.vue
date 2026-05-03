<template>
  <button
    class="field-button"
    type="button"
    :disabled="props.disabled"
    @click="chooseField"
  >
    <span class="field-label">{{ props.label }}</span>
    <span class="stimulus-grid" :style="gridStyle">
      <span
        v-for="(item, index) in props.items"
        :key="index"
        class="stimulus-cell"
      >
        <span
          class="stimulus-object"
          :class="[`shape-${item.shape}`, { hidden: props.hidden }]"
          :style="objectStyle(item)"
        />
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  side: {
    type: String as PropType<Side>,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  items: {
    type: Array as PropType<StimulusItem[]>,
    required: true,
  },
  columns: {
    type: Number,
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["choose"]);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
}));

function chooseField() {
  emit("choose", props.side);
}

function objectStyle(item: StimulusItem) {
  const height =
    item.shape === "bar"
      ? Math.max(6, Math.round(item.size * 0.32))
      : item.size;

  return {
    backgroundColor: item.color,
    height: `${height}px`,
    transform: `rotate(${item.rotation}deg)`,
    width: `${item.size}px`,
  };
}
</script>

<style scoped>
.field-button {
  background: #ffffff;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  color: inherit;
  cursor: pointer;
  display: block;
  min-height: 420px;
  padding: 18px;
  text-align: left;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
  width: 100%;
}

.field-button:not(:disabled):hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 12px 36px rgba(37, 99, 235, 0.13);
  transform: translateY(-1px);
}

.field-button:not(:disabled):focus-visible {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.18);
  outline: none;
}

.field-button:disabled {
  cursor: default;
}

.field-label {
  color: rgb(var(--v-theme-on-surface-variant));
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 14px;
  text-transform: uppercase;
}

.stimulus-grid {
  background:
    linear-gradient(rgba(23, 32, 51, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(23, 32, 51, 0.03) 1px, transparent 1px);
  background-size: 38px 38px;
  border-radius: 10px;
  display: grid;
  gap: 12px;
  height: calc(100% - 30px);
  place-items: center;
  padding: 8px;
}

.stimulus-cell {
  display: grid;
  height: 38px;
  place-items: center;
  width: 38px;
}

.stimulus-object {
  display: block;
  box-shadow: 0 1px 1px rgba(23, 32, 51, 0.08);
  transition: opacity 120ms ease;
}

.stimulus-object.hidden {
  opacity: 0;
}

.shape-circle {
  border-radius: 50%;
}

.shape-triangle {
  clip-path: polygon(50% 4%, 96% 92%, 4% 92%);
}

.shape-diamond {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}

.shape-square,
.shape-bar {
  border-radius: 2px;
}
</style>
