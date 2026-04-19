<template>
  <div class="d-flex flex-column ga-4">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3">
      <div>
        <div class="section-kicker mb-1">Progress</div>
        <div class="text-h6 font-weight-bold">Experiment stages</div>
      </div>

      <v-chip color="primary" variant="tonal">
        Step {{ currentStageIndex + 1 }} / {{ STAGES.length }}
      </v-chip>
    </div>

    <div class="stage-indicator-grid">
      <v-sheet
        v-for="(stage, idx) in STAGES"
        :key="stage.id"
        :class="stageCardClasses(stage.id)"
        class="stage-card pa-4"
        rounded="xl"
        @click="onStageClick(stage.id)"
      >
        <div class="d-flex align-center justify-space-between ga-3 mb-4">
          <v-avatar
            :color="avatarColor(stage.id)"
            :variant="stage.id === currentStage ? 'flat' : 'tonal'"
            size="42"
          >
            <v-icon v-if="isCompleted(stage.id)">mdi-check</v-icon>
            <span v-else>{{ idx + 1 }}</span>
          </v-avatar>

          <v-chip
            :color="chipColor(stage.id)"
            density="comfortable"
            size="small"
            :variant="stage.id === currentStage ? 'flat' : 'tonal'"
          >
            {{ statusLabel(stage.id) }}
          </v-chip>
        </div>

        <div class="text-subtitle-1 font-weight-bold mb-1">
          {{ stage.label }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ stageDescription(stage.id) }}
        </div>
      </v-sheet>
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
const currentStageIndex = computed(() =>
  Math.max(
    0,
    STAGES.findIndex((stage) => stage.id === currentStage.value),
  ),
);

function statusLabel(stageId: string) {
  if (stageId === currentStage.value) {
    return "Active";
  }

  return isCompleted(stageId) ? "Complete" : "Upcoming";
}

function isCompleted(stageId: string) {
  return STAGES.findIndex((stage) => stage.id === stageId) < currentStageIndex.value;
}

function avatarColor(stageId: string) {
  if (stageId === currentStage.value) {
    return "primary";
  }

  return isCompleted(stageId) ? "success" : "surface-variant";
}

function chipColor(stageId: string) {
  if (stageId === currentStage.value) {
    return "primary";
  }

  return isCompleted(stageId) ? "success" : "secondary";
}

function stageDescription(stageId: string) {
  if (stageId === "INTRO") {
    return "Methodology, study scope, and experiment overview.";
  }

  if (stageId === "PARTICIPANT") {
    return "Session identity, notes, and quick experiment guidance.";
  }

  if (stageId === "EXPERIMENT") {
    return "Interactive ratio matching for circles and squares.";
  }

  return "Session analytics, imports, and exported experiment data.";
}

function stageCardClasses(stageId: string) {
  return {
    "stage-card--active": stageId === currentStage.value,
    "stage-card--completed": isCompleted(stageId),
    "stage-card--clickable": ["INTRO", "RESULTS"].includes(stageId),
  };
}

function onStageClick(stageId: string) {
  if (!["INTRO", "RESULTS"].includes(stageId)) return;

  currentStage.value = stageId;
}
</script>

<style scoped>
.stage-indicator-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.stage-card {
  background: rgba(24, 48, 58, 0.42);
  border: 1px solid rgba(230, 241, 244, 0.08);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.stage-card--active {
  background: rgba(var(--v-theme-primary), 0.14);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.stage-card--completed {
  border-color: rgba(var(--v-theme-success), 0.32);
}

.stage-card--clickable {
  cursor: pointer;
}

.stage-card--clickable:hover {
  transform: translateY(-2px);
}
</style>
