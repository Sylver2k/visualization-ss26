<template>
  <div class="experiment-shell">
    <experiment-setup v-if="stage === 'setup'" @start="startExperiment" />

    <v-sheet
      v-else-if="stage === 'ready'"
      class="experiment-panel"
      border
      rounded="lg"
    >
      <div class="experiment-toolbar">
        <v-btn prepend-icon="mdi-cog" variant="text" @click="resetToSetup">
          Setup
        </v-btn>

        <v-chip color="primary" variant="tonal" label>
          Trial {{ trialNumber }} / {{ settings.trials }}
        </v-chip>
      </div>

      <div class="ready-state">
        <v-icon color="primary" icon="mdi-eye-check-outline" size="56" />
        <div class="text-h4 font-weight-bold mt-4">
          Ready for the next stimulus?
        </div>
        <div class="text-body-1 text-medium-emphasis">
          The stimulus appears briefly. After it disappears, choose the field
          where the target was shown.
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-play"
          size="large"
          @click="beginTrial"
        >
          Ready
        </v-btn>
      </div>
    </v-sheet>

    <v-sheet
      v-else-if="stage === 'stimulus' || stage === 'answer'"
      class="experiment-panel"
      border
      rounded="lg"
    >
      <div class="experiment-toolbar">
        <div>
          <div class="text-overline text-medium-emphasis mb-0">
            Trial {{ trialNumber }}
          </div>
          <div class="text-h6 font-weight-bold">{{ conditionLabel }}</div>
        </div>
        <v-chip
          :color="stage === 'stimulus' ? 'primary' : 'surface-variant'"
          variant="tonal"
          label
        >
          {{
            stage === "stimulus" ? `${settings.displayMs} ms` : "Choose a field"
          }}
        </v-chip>
      </div>

      <experiment-arena
        :answer-enabled="stage === 'answer'"
        :columns="arenaColumns"
        :hidden="stage === 'answer'"
        :stimulus="currentStimulus"
        @choose="chooseSide"
      />

      <div
        v-if="stage === 'answer'"
        class="d-flex align-center justify-center ga-4 mt-6"
      >
        <v-btn
          color="primary"
          prepend-icon="mdi-arrow-left"
          size="large"
          @click="chooseSide('left')"
        >
          Left field
        </v-btn>

        <v-btn
          color="primary"
          variant="outlined"
          size="large"
          @click="chooseSide('none')"
        >
          I don't know
        </v-btn>

        <v-btn
          color="primary"
          append-icon="mdi-arrow-right"
          size="large"
          @click="chooseSide('right')"
        >
          Right field
        </v-btn>
      </div>
    </v-sheet>

    <v-sheet
      v-else-if="stage === 'feedback'"
      class="experiment-panel"
      border
      rounded="lg"
    >
      <div class="feedback-state">
        <v-icon
          :color="lastResult?.correct ? 'success' : 'error'"
          :icon="
            lastResult?.correct
              ? 'mdi-check-circle-outline'
              : 'mdi-close-circle-outline'
          "
          size="64"
        />
        <div class="text-h4 font-weight-bold mt-4">
          {{ lastResult?.correct ? "Correct" : "Not quite" }}
        </div>
        <div class="text-body-1 text-medium-emphasis">
          Target was in the
          {{ sideLabel(lastResult?.targetSide ?? "left").toLowerCase() }}.
        </div>
        <v-btn
          color="primary"
          :prepend-icon="isFinished ? 'mdi-chart-box-outline' : 'mdi-skip-next'"
          size="large"
          @click="continueAfterFeedback"
        >
          {{ isFinished ? "Show results" : "Next trial" }}
        </v-btn>
      </div>
    </v-sheet>

    <experiment-results
      v-else
      :results="results"
      :settings="settings"
      @reset="resetToSetup"
    />
  </div>
</template>

<script setup lang="ts">
const defaultSettings: ExperimentSettings = {
  feature: "color",
  displayMs: 250,
  conjunction: false,
  diversity: "low",
  itemCount: 24,
  trials: 8,
};

const TARGET_COLOR = "#e53935";
const BASE_COLOR = "#263238";
const TARGET_SHAPE: Shape = "triangle";
const TARGET_SIZE = 34;
const TARGET_ROTATION = 45;

const MEDIUM_COLORS = [BASE_COLOR, "#455a64", "#00695c"];
const HIGH_COLORS = [
  "#0072b2",
  "#009e73",
  "#e69f00",
  "#cc79a7",
  "#56b4e9",
  "#f0e442",
  "#111827",
];
const MEDIUM_SHAPES: Shape[] = ["circle", "square"];
const HIGH_SHAPES: Shape[] = ["circle", "square", "diamond", "bar"];
const MEDIUM_SIZES = [20, 22, 24, 26];
const HIGH_SIZES = [14, 18, 22, 26, 30];
const MEDIUM_ROTATIONS = [0, 90];
const HIGH_ROTATIONS = [0, 30, 90, 135];

const stage = ref<Stage>("setup");
const settings = ref<ExperimentSettings>({ ...defaultSettings });
const currentStimulus = ref<Stimulus | null>(null);
const trialNumber = ref(1);
const results = ref<TrialResult[]>([]);
let stimulusTimer: ReturnType<typeof setTimeout> | null = null;

const arenaColumns = computed(() => (settings.value.itemCount > 32 ? 8 : 6));

const conditionLabel = computed(() => {
  const parts = [
    featureLabel(settings.value.feature),
    `${settings.value.diversity} diversity`,
  ];
  if (settings.value.conjunction) {
    parts.push("conjunction search");
  }
  return parts.join(" · ");
});

const lastResult = computed(() => results.value.at(-1));
const isFinished = computed(
  () => results.value.length >= settings.value.trials,
);

onBeforeUnmount(() => {
  clearStimulusTimer();
});

function startExperiment(nextSettings: ExperimentSettings) {
  settings.value = { ...nextSettings };
  results.value = [];
  trialNumber.value = 1;
  currentStimulus.value = null;
  stage.value = "ready";
}

function beginTrial() {
  clearStimulusTimer();
  currentStimulus.value = createStimulus(settings.value);
  stage.value = "stimulus";
  stimulusTimer = setTimeout(() => {
    stage.value = "answer";
  }, settings.value.displayMs);
}

function chooseSide(answer: Side) {
  if (stage.value !== "answer" || !currentStimulus.value) {
    return;
  }

  results.value.push({
    trial: trialNumber.value,
    targetSide: currentStimulus.value.targetSide,
    answer,
    correct: answer === currentStimulus.value.targetSide,
  });

  stage.value = "feedback";
}

function continueAfterFeedback() {
  if (isFinished.value) {
    stage.value = "results";
    return;
  }

  trialNumber.value += 1;
  currentStimulus.value = null;
  stage.value = "ready";
}

function resetToSetup() {
  clearStimulusTimer();
  currentStimulus.value = null;
  stage.value = "setup";
}

function clearStimulusTimer() {
  if (stimulusTimer) {
    clearTimeout(stimulusTimer);
    stimulusTimer = null;
  }
}

function sideLabel(side: Side) {
  return side === "left" ? "Left field" : "Right field";
}

function featureLabel(feature: Feature) {
  const labels: Record<Feature, string> = {
    color: "Color",
    shape: "Shape",
    size: "Size",
    diagonal: "Diagonal orientation",
  };
  return labels[feature];
}

function createStimulus(config: ExperimentSettings): Stimulus {
  const targetSide = Math.random() > 0.5 ? "left" : "right";
  return {
    left: createField(config, targetSide === "left"),
    right: createField(config, targetSide === "right"),
    targetSide,
  };
}

function createField(config: ExperimentSettings, includeTarget: boolean) {
  const items = Array.from({ length: config.itemCount }, (_, index) =>
    createDistractor(config, index),
  );

  if (includeTarget) {
    items[Math.floor(Math.random() * items.length)] = createTarget(config);
  }

  return shuffle(items);
}

function createTarget(config: ExperimentSettings): StimulusItem {
  if (config.conjunction) {
    return { shape: TARGET_SHAPE, color: TARGET_COLOR, size: 24, rotation: 0 };
  }

  const targetByFeature: Record<Feature, StimulusItem> = {
    color: { shape: "circle", color: TARGET_COLOR, size: 22, rotation: 0 },
    shape: { shape: TARGET_SHAPE, color: BASE_COLOR, size: 24, rotation: 0 },
    size: { shape: "circle", color: BASE_COLOR, size: TARGET_SIZE, rotation: 0 },
    diagonal: {
      shape: "bar",
      color: BASE_COLOR,
      size: TARGET_SIZE,
      rotation: TARGET_ROTATION,
    },
  };
  return targetByFeature[config.feature];
}

function createDistractor(
  config: ExperimentSettings,
  index: number,
): StimulusItem {
  if (config.conjunction) {
    return createConjunctionDistractor(config, index);
  }

  const baseByFeature: Record<Feature, StimulusItem> = {
    color: { shape: "circle", color: BASE_COLOR, size: 22, rotation: 0 },
    shape: { shape: "circle", color: BASE_COLOR, size: 24, rotation: 0 },
    size: { shape: "circle", color: BASE_COLOR, size: 22, rotation: 0 },
    diagonal: { shape: "bar", color: BASE_COLOR, size: TARGET_SIZE, rotation: 0 },
  };

  return applyDistractorDiversity(baseByFeature[config.feature], config, index);
}

function createConjunctionDistractor(
  config: ExperimentSettings,
  index: number,
): StimulusItem {
  const lowBank: StimulusItem[] = [
    { shape: TARGET_SHAPE, color: "#1565c0", size: 24, rotation: 0 },
    { shape: "circle", color: TARGET_COLOR, size: 24, rotation: 0 },
  ];

  if (config.diversity === "low") {
    return { ...lowBank[index % lowBank.length] };
  }

  const mediumBank: StimulusItem[] = [
    ...lowBank,
    { shape: TARGET_SHAPE, color: "#00695c", size: 22, rotation: 0 },
    { shape: "square", color: TARGET_COLOR, size: 24, rotation: 0 },
  ];

  if (config.diversity === "medium") {
    return { ...mediumBank[index % mediumBank.length] };
  }

  const highBank: StimulusItem[] = [
    { shape: TARGET_SHAPE, color: "#0072b2", size: 18, rotation: 0 },
    { shape: TARGET_SHAPE, color: "#009e73", size: 24, rotation: 0 },
    { shape: TARGET_SHAPE, color: "#e69f00", size: 30, rotation: 0 },
    { shape: TARGET_SHAPE, color: "#cc79a7", size: 22, rotation: 0 },
    { shape: "circle", color: TARGET_COLOR, size: 18, rotation: 0 },
    { shape: "square", color: TARGET_COLOR, size: 26, rotation: 0 },
    { shape: "diamond", color: TARGET_COLOR, size: 30, rotation: 0 },
    { shape: "bar", color: TARGET_COLOR, size: 28, rotation: 90 },
  ];

  return ensureDistractorSafety(highBank[index % highBank.length], config);
}

function applyDistractorDiversity(
  item: StimulusItem,
  config: ExperimentSettings,
  index: number,
): StimulusItem {
  if (config.diversity === "low") {
    return { ...item };
  }

  if (config.diversity === "medium") {
    return createMediumDistractor(item, config, index);
  }

  return createHighDistractor(config, index);
}

function createMediumDistractor(
  item: StimulusItem,
  config: ExperimentSettings,
  index: number,
): StimulusItem {
  if (index % 3 !== 0) {
    return { ...item };
  }

  const sizeOffsets = [-2, 0, 2];
  const mediumItem = { ...item };

  if (config.feature === "color") {
    mediumItem.color = MEDIUM_COLORS[index % MEDIUM_COLORS.length];
    mediumItem.size = item.size + sizeOffsets[index % sizeOffsets.length];
  }

  if (config.feature === "shape") {
    mediumItem.color = MEDIUM_COLORS[index % MEDIUM_COLORS.length];
    mediumItem.shape = MEDIUM_SHAPES[index % MEDIUM_SHAPES.length];
  }

  if (config.feature === "size") {
    mediumItem.color = MEDIUM_COLORS[index % MEDIUM_COLORS.length];
    mediumItem.size = MEDIUM_SIZES[index % MEDIUM_SIZES.length];
  }

  if (config.feature === "diagonal") {
    mediumItem.color = MEDIUM_COLORS[index % MEDIUM_COLORS.length];
    mediumItem.rotation = MEDIUM_ROTATIONS[index % MEDIUM_ROTATIONS.length];
    mediumItem.size = item.size + sizeOffsets[index % sizeOffsets.length];
  }

  return ensureDistractorSafety(
    mediumItem,
    config,
  );
}

function createHighDistractor(
  config: ExperimentSettings,
  index: number,
): StimulusItem {
  return ensureDistractorSafety(
    {
      color: HIGH_COLORS[index % HIGH_COLORS.length],
      rotation: HIGH_ROTATIONS[(index * 5) % HIGH_ROTATIONS.length],
      shape: HIGH_SHAPES[(index * 3) % HIGH_SHAPES.length],
      size: HIGH_SIZES[(index * 2) % HIGH_SIZES.length],
    },
    config,
  );
}

function ensureDistractorSafety(
  item: StimulusItem,
  config: ExperimentSettings,
): StimulusItem {
  if (!isTargetEquivalent(item, config)) {
    return { ...item };
  }

  if (config.conjunction) {
    return { ...item, color: "#0072b2" };
  }

  const safeFallbackByFeature: Record<Feature, Partial<StimulusItem>> = {
    color: { color: "#0072b2" },
    shape: { shape: "circle" },
    size: { size: 26 },
    diagonal: { rotation: 0 },
  };

  return { ...item, ...safeFallbackByFeature[config.feature] };
}

function isTargetEquivalent(item: StimulusItem, config: ExperimentSettings) {
  if (config.conjunction) {
    return item.shape === TARGET_SHAPE && item.color === TARGET_COLOR;
  }

  const targetCheckByFeature: Record<Feature, boolean> = {
    color: item.color === TARGET_COLOR,
    shape: item.shape === TARGET_SHAPE,
    size: item.size === TARGET_SIZE,
    diagonal: item.shape === "bar" && item.rotation === TARGET_ROTATION,
  };

  return targetCheckByFeature[config.feature];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
</script>

<style scoped>
.experiment-shell {
  margin: 0 auto;
  max-width: 1180px;
}

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

.ready-state,
.feedback-state {
  display: grid;
  justify-items: center;
  gap: 12px;
  min-height: 420px;
  place-content: center;
  text-align: center;
}
</style>
