<template>
  <v-sheet class="experiment-panel" border rounded="lg">
    <div class="experiment-toolbar">
      <div>
        <div class="text-overline text-medium-emphasis mb-0">Results</div>
        <div class="text-h4 font-weight-bold">Experiment summary</div>
      </div>
      <v-btn prepend-icon="mdi-restart" variant="tonal" @click="emit('reset')">
        New setup
      </v-btn>
    </div>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-sheet class="metric" color="success" rounded="lg">
          <span class="metric-value">{{ accuracyPercent }}%</span>
          <span class="metric-label">accuracy</span>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="4">
        <v-sheet class="metric" color="primary" rounded="lg">
          <span class="metric-value">{{ props.results.length }}</span>
          <span class="metric-label">trials</span>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="4">
        <v-sheet class="metric" color="secondary" rounded="lg">
          <span class="metric-value">{{ props.settings.displayMs }} ms</span>
          <span class="metric-label">stimulus time</span>
        </v-sheet>
      </v-col>
    </v-row>

    <v-table density="comfortable">
      <thead>
        <tr>
          <th>Trial</th>
          <th>Target</th>
          <th>Answer</th>
          <th>Correct</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in props.results" :key="result.trial">
          <td>{{ result.trial }}</td>
          <td>{{ sideLabel(result.targetSide) }}</td>
          <td>{{ sideLabel(result.answer) }}</td>
          <td>{{ result.correct ? "Yes" : "No" }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-sheet>
</template>

<script setup lang="ts">
const props = defineProps({
  settings: {
    type: Object as PropType<ExperimentSettings>,
    required: true,
  },
  results: {
    type: Array as PropType<TrialResult[]>,
    required: true,
  },
});

const emit = defineEmits(["reset"]);

const accuracyPercent = computed(() => {
  if (!props.results.length) {
    return 0;
  }
  const correct = props.results.filter((result) => result.correct).length;
  return Math.round((correct / props.results.length) * 100);
});

function sideLabel(side: Side) {
  switch (side) {
    case "left":
      return "Left field";
    case "right":
      return "Right field";
    default:
      return "I don't know";
  }
}
</script>

<style scoped>
.experiment-panel {
  padding: 32px;
}

.experiment-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.metric {
  color: white;
  display: grid;
  min-height: 112px;
  padding: 20px;
}

.metric-value {
  align-self: end;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1;
}

.metric-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

@media (max-width: 820px) {
  .experiment-panel {
    padding: 20px;
  }

  .experiment-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
