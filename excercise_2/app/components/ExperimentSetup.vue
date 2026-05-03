<template>
  <v-sheet class="setup-panel" border rounded="lg">
    <v-form @submit.prevent="startExperiment">
      <div class="setup-header">
        <div>
          <div class="text-overline text-medium-emphasis mb-1">
            Guided experiment
          </div>
          <div class="text-h4 font-weight-bold mb-2">
            Preattentive perception test
          </div>
          <div class="text-body-1 text-medium-emphasis">
            Configure one stimulus condition, run a short sequence of trials,
            and compare results.
          </div>
        </div>
      </div>

      <v-divider class="my-6" />

      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="draft.feature"
            :items="featureOptions"
            item-title="title"
            item-value="value"
            label="Preattentive feature"
            prepend-inner-icon="mdi-shape-outline"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="draft.diversity"
            :items="diversityOptions"
            item-title="title"
            item-value="value"
            label="Distractor diversity"
            prepend-inner-icon="mdi-view-grid-plus-outline"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-slider
            v-model="draft.displayMs"
            color="primary"
            label="Display time"
            :min="50"
            :max="1500"
            :step="50"
            thumb-label
          >
            <template #append>
              <v-text-field
                v-model.number="draft.displayMs"
                class="number-field"
                density="compact"
                hide-details
                max="1500"
                min="50"
                suffix="ms"
                type="number"
                variant="outlined"
              />
            </template>
          </v-slider>
        </v-col>

        <v-col cols="12" md="6">
          <v-slider
            v-model="draft.itemCount"
            color="primary"
            label="Elements per field"
            :min="12"
            :max="48"
            :step="4"
            thumb-label
          >
            <template #append>
              <v-text-field
                v-model.number="draft.itemCount"
                class="number-field"
                density="compact"
                hide-details
                max="48"
                min="12"
                type="number"
                variant="outlined"
              />
            </template>
          </v-slider>
        </v-col>

        <v-col cols="12" md="6">
          <v-slider
            v-model="draft.trials"
            color="primary"
            label="Trials"
            :min="4"
            :max="24"
            :step="2"
            thumb-label
          >
            <template #append>
              <v-text-field
                v-model.number="draft.trials"
                class="number-field"
                density="compact"
                hide-details
                max="24"
                min="4"
                type="number"
                variant="outlined"
              />
            </template>
          </v-slider>
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="draft.conjunction"
            color="primary"
            hide-details
            inset
            label="Conjunction search"
          />
          <div class="text-caption text-medium-emphasis mt-1">
            Target is defined by a combination of properties; distractors share
            one of them.
          </div>
        </v-col>
      </v-row>

      <div class="setup-actions">
        <v-btn
          color="primary"
          prepend-icon="mdi-play"
          size="large"
          type="submit"
          variant="flat"
        >
          Start experiment
        </v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
const emit = defineEmits(["start"]);

const draft = reactive<ExperimentSettings>({
  feature: "color",
  displayMs: 250,
  conjunction: false,
  diversity: "low",
  itemCount: 24,
  trials: 8,
});

const featureOptions = [
  { title: "Color", value: "color" },
  { title: "Shape", value: "shape" },
  { title: "Size", value: "size" },
  { title: "Diagonal orientation", value: "diagonal" },
];

const diversityOptions = [
  { title: "Low - uniform distractors", value: "low" },
  { title: "Medium - mild distractor differences", value: "medium" },
  { title: "High - strong distractor differences", value: "high" },
];

function startExperiment() {
  emit("start", {
    feature: draft.feature,
    displayMs: clamp(draft.displayMs, 50, 5000),
    conjunction: draft.conjunction,
    diversity: draft.diversity,
    itemCount: clamp(draft.itemCount, 12, 48),
    trials: clamp(draft.trials, 4, 24),
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
</script>

<style scoped>
.setup-panel {
  padding: 32px;
}

.setup-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.number-field {
  width: 112px;
}

.setup-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}

@media (max-width: 720px) {
  .setup-panel {
    padding: 20px;
  }

  .setup-header,
  .setup-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
