<template>
  <v-sheet class="experiment-panel glass-panel" rounded="xl">
    <div class="experiment-toolbar">
      <div>
        <div class="section-kicker text-caption mb-1">Results</div>
        <div class="results-title text-h4 font-weight-bold">
          Experiment summary
        </div>
      </div>
      <v-btn prepend-icon="mdi-restart" variant="tonal" @click="emit('reset')">
        New setup
      </v-btn>
    </div>

    <v-row class="metric-row mt-2">
      <v-col cols="12" md="4">
        <v-sheet class="metric metric-success" rounded="lg">
          <span class="metric-value">{{ accuracyPercent }}%</span>
          <span class="metric-label">accuracy</span>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="4">
        <v-sheet class="metric metric-primary" rounded="lg">
          <span class="metric-value">{{ props.results.length }}</span>
          <span class="metric-label">trials</span>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="4">
        <v-sheet class="metric metric-secondary" rounded="lg">
          <span class="metric-value">{{ props.settings.displayMs }} ms</span>
          <span class="metric-label">stimulus time</span>
        </v-sheet>
      </v-col>
    </v-row>

    <v-sheet class="results-table" rounded="lg">
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
            <td>
              <v-chip
                :color="result.correct ? 'success' : 'error'"
                size="small"
                variant="tonal"
                label
              >
                {{ result.correct ? "Yes" : "No" }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-sheet>
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
  overflow: hidden;
  padding: 32px;
}

.experiment-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.results-title {
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: 0;
}

.metric-row {
  --v-gutter-y: 18px;
}

.metric {
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: white;
  display: grid;
  min-height: 112px;
  padding: 20px;
  position: relative;
}

.metric-primary {
  background: linear-gradient(135deg, #2563eb, #0284c7);
}

.metric-secondary {
  background: linear-gradient(135deg, #0f9f9a, #0f766e);
}

.metric-success {
  background: linear-gradient(135deg, #16a34a, #22c55e);
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

.results-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-top: 28px;
  overflow: hidden;
}

.results-table :deep(th) {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 800 !important;
  letter-spacing: 0;
  text-transform: uppercase;
}
</style>
