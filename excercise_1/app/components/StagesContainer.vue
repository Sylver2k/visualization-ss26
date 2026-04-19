<template>
  <v-fade-transition mode="out-in">
    <div :key="stage">
      <intro-stage
        v-if="stage === 'INTRO'"
        @start-experiment="stage = 'PARTICIPANT'"
      />

      <participant-stage
        v-else-if="stage === 'PARTICIPANT'"
        v-model="participant"
        @beginn-session="stage = 'EXPERIMENT'"
      />

      <experiment-stage
        v-else-if="stage === 'EXPERIMENT'"
        :participant="participant"
        @completed="handleExperimentCompletion"
      />

      <results-stage
        v-else-if="stage === 'RESULTS'"
        :results-payload="participantResults"
      />
    </div>
  </v-fade-transition>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const stage = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});

const participant = ref<Participant>({
  id: "",
  notes: "",
});

const participantResults = ref<ExportPayload | null>(null);

function handleExperimentCompletion(payload: ExportPayload) {
  participantResults.value = payload;

  stage.value = "RESULTS";
}
</script>

<style scoped></style>
