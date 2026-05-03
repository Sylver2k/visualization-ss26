<template>
  <div class="arena">
    <experiment-field
      v-for="side in sides"
      :key="side"
      :columns="props.columns"
      :disabled="!props.answerEnabled"
      :hidden="props.hidden"
      :items="fieldItems(side)"
      :label="sideLabel(side)"
      :side="side"
      @choose="emit('choose', side)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  stimulus: {
    type: Object as PropType<Stimulus | null>,
    default: null,
  },
  columns: {
    type: Number,
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  answerEnabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["choose"]);

const sides: Side[] = ["left", "right"];

function fieldItems(side: Side) {
  return props.stimulus?.[side] ?? [];
}

function sideLabel(side: Side) {
  return side === "left" ? "Left field" : "Right field";
}
</script>

<style scoped>
.arena {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
