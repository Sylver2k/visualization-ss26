<template>
  <div class="d-flex align-center ga-8">
    <div
      v-for="(stage, idx) in STAGES"
      :key="stage.id"
      class="d-flex flex-column align-center"
    >
      <v-avatar
        :color="stage.id === currentStage ? 'grey-darken-4' : 'grey'"
        size="24"
        @click="onStageClick(stage.id)"
      >
        {{ idx + 1 }}
      </v-avatar>

      <div
        class="text-body-2"
        :class="{ 'text-grey-darken-1': stage.id !== currentStage }"
      >
        {{ stage.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "set-stage"]);

const currentStage = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});

const { STAGES } = useDefaults();

function onStageClick(stageId: string) {
  if (!["INTRO", "RESULTS"].includes(stageId)) return;

  currentStage.value = stageId;
}
</script>

<style scoped></style>
