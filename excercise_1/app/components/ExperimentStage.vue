<template>
  <div class="d-flex flex-column ga-4">
    <v-slide-y-transition appear>
      <v-card class="glass-card" rounded="xlarge">
        <v-card-text
          class="d-flex flex-wrap align-center justify-space-between ga-4 pa-5 pa-md-6"
        >
          <div class="d-flex flex-column ga-1">
            <div class="section-kicker">Experiment</div>
            <h2 class="text-h5">{{ participant.id }}</h2>
            <p class="text-body-2 text-medium-emphasis">
              Complete one randomized pass of the target ratios for circles and
              squares.
            </p>
          </div>

          <div class="d-flex flex-wrap align-center ga-3">
            <v-switch
              v-model="activeMode"
              class="flex-grow-0"
              color="primary"
              false-value="circle"
              true-value="square"
              :disabled="modeSwitchDisabled || isExperimentComplete"
              hide-details
              inset
            >
              <template #label>
                <span class="text-body-2">
                  Mode:
                  <strong>{{ currentShapeLabel }}</strong>
                </span>
              </template>
            </v-switch>

            <v-chip color="primary" size="large" variant="tonal">
              {{ currentTrialLabel }}
            </v-chip>

            <v-chip color="secondary" size="large" variant="outlined">
              Target ratio {{ currentTrial?.targetRatio ?? "-" }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <v-slide-y-transition appear>
      <v-card class="glass-card" rounded="xlarge">
        <v-card-text class="d-flex flex-column ga-4 pa-5 pa-md-6">
          <div class="d-flex flex-wrap align-center justify-space-between ga-3">
            <div class="d-flex flex-column ga-2">
              <div class="section-kicker">Progress</div>
              <div class="text-body-1">
                {{ progressDescription }}
              </div>
            </div>

            <div
              v-if="modeSwitchDisabled && !isExperimentComplete"
              class="text-caption text-medium-emphasis"
            >
              Mode switching is locked after the first confirmed trial in this
              mode.
            </div>
          </div>

          <v-progress-linear
            :model-value="progressValue"
            color="primary"
            height="10"
            rounded
          />
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <v-fade-transition mode="out-in">
      <div :key="currentTrial ? currentTrial.id : isInitialized ? 'complete' : 'loading'">
        <experiment-trial-canvas
          v-if="isInitialized && currentTrial"
          v-model:adjustable-size="adjustableSize"
          :shape="currentTrial.shape"
          :reference-size="REFERENCE_SIZE"
          :target-ratio="currentTrial.targetRatio"
          :trial-label="currentTrialLabel"
        />

        <v-card v-else-if="isInitialized" class="glass-card experiment-complete-card" rounded="xlarge">
          <v-card-text class="d-flex flex-column ga-4 pa-6">
            <div class="d-flex flex-column ga-2">
              <div class="section-kicker">Next Step</div>
              <h3 class="text-h5 font-weight-bold">All trials completed</h3>
              <p class="text-body-2 text-medium-emphasis">
                The session is ready. Continue to the results view to inspect and
                export the recorded measurements.
              </p>
            </div>

            <div class="experiment-complete-actions d-flex flex-wrap align-center justify-space-between ga-3">
              <div class="d-flex align-center ga-3">
                <v-chip color="primary" variant="tonal">
                  {{ completedTrials.length }} recorded trial(s)
                </v-chip>

                <v-chip color="secondary" variant="outlined">
                  Session {{ currentSessionId }}
                </v-chip>
              </div>

              <v-btn
                class="analyse-results-btn"
                color="primary"
                elevation="10"
                prepend-icon="mdi-file-export"
                rounded="pill"
                size="x-large"
                @click="analyseResults"
              >
                View Results
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card v-else class="glass-card" rounded="xlarge">
          <v-card-text class="text-body-2 pa-6">
            Preparing experiment session...
          </v-card-text>
        </v-card>
      </div>
    </v-fade-transition>

    <v-fade-transition>
      <div v-if="!isExperimentComplete">
        <v-card class="glass-card" rounded="xlarge">
          <v-card-text
            class="d-flex flex-wrap align-center justify-space-between ga-4 pa-5 pa-md-6"
          >
            <div class="d-flex flex-column ga-1">
              <h3 class="text-h6">Trial Controls</h3>
              <p class="text-body-2 text-medium-emphasis">
                Use the drag handle to adjust the second shape until it matches the
                requested perceived ratio. Press Enter to confirm the current
                trial.
              </p>
            </div>

            <div class="d-flex flex-wrap align-center ga-3">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-check"
                :disabled="!currentTrial"
                @click="confirmTrial"
              >
                Confirm Trial
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  participant: {
    type: Object as PropType<Participant>,
    required: true,
  },
});

const emit = defineEmits({
  completed(payload: ExportPayload) {},
});

const { TARGET_RATIOS, REFERENCE_SIZE } = useDefaults();

const isInitialized = ref(false);
const currentSessionId = ref("");
const sessionCreatedAt = ref("");
const activeMode = ref<ShapeType>("circle");
const adjustableSize = ref(REFERENCE_SIZE);
const completedTrials = ref<TrialResult[]>([]);
const circleTrials = ref<TrialDefinition[]>([]);
const squareTrials = ref<TrialDefinition[]>([]);
const trialIndices = reactive<Record<ShapeType, number>>({
  circle: 0,
  square: 0,
});

const currentTrials = computed(() =>
  activeMode.value === "circle" ? circleTrials.value : squareTrials.value,
);

const currentTrialIndex = computed(() => trialIndices[activeMode.value]);

const currentTrial = computed(
  () => currentTrials.value[currentTrialIndex.value] ?? null,
);

const currentShapeLabel = computed(() =>
  activeMode.value === "circle" ? "Circle" : "Square",
);

const currentTrialLabel = computed(() => {
  if (!currentTrial.value) {
    return "Completed";
  }

  return `Trial ${currentTrialIndex.value + 1} / ${currentTrials.value.length}`;
});

const progressValue = computed(() => {
  if (!currentTrials.value.length) {
    return 0;
  }

  return (currentTrialIndex.value / currentTrials.value.length) * 100;
});

const progressDescription = computed(() => {
  const completedForMode = trialIndices[activeMode.value];
  const totalForMode = currentTrials.value.length;

  return `${currentShapeLabel.value}: ${completedForMode} of ${totalForMode} trial(s) confirmed`;
});

const isExperimentComplete = computed(
  () => isShapeComplete("circle") && isShapeComplete("square"),
);

const modeSwitchDisabled = computed(() => {
  if (isExperimentComplete.value) {
    return true;
  }

  return getCompletedCountForShape(activeMode.value) > 0;
});

const currentSession = computed<SessionResult>(() => ({
  sessionId: currentSessionId.value,
  createdAt: sessionCreatedAt.value,
  participant: {
    id: props.participant.id.trim(),
    notes: props.participant.notes.trim(),
  },
  referenceSize: REFERENCE_SIZE,
  trials: completedTrials.value,
}));

watch(activeMode, () => {
  if (!isInitialized.value) {
    return;
  }

  resetTrialInteraction();
});

onMounted(() => {
  window.addEventListener("keydown", onWindowKeydown);
  initializeExperiment();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onWindowKeydown);
});

function initializeExperiment() {
  currentSessionId.value = createSessionId();
  sessionCreatedAt.value = new Date().toISOString();
  activeMode.value = "circle";
  completedTrials.value = [];
  circleTrials.value = createTrials("circle");
  squareTrials.value = createTrials("square");
  trialIndices.circle = 0;
  trialIndices.square = 0;
  resetTrialInteraction();
  isInitialized.value = true;
}

function createTrials(shape: ShapeType) {
  return shuffle(
    TARGET_RATIOS.map((targetRatio, index) => ({
      id: `${shape}-${targetRatio}-${index}`,
      shape,
      targetRatio,
      orderIndex: index,
    })),
  ).map((trial, orderIndex) => ({
    ...trial,
    orderIndex,
  }));
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }

  return copy;
}

function createSessionId() {
  const participantId = slugify(props.participant.id || "participant");
  return `${new Date().toISOString()}--${participantId}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateAreaRatio(finalSize: number, referenceSize: number) {
  return (finalSize * finalSize) / (referenceSize * referenceSize);
}

function computeX(targetRatio: number, actualAreaRatio: number) {
  const denominator = Math.log(actualAreaRatio);

  if (Math.abs(denominator) < 1e-6) {
    return { value: null, valid: false, reason: "Log denominator unstable" };
  }

  const value = Math.log(targetRatio) / denominator;

  if (!Number.isFinite(value)) {
    return { value: null, valid: false, reason: "Computed x is not finite" };
  }

  return { value, valid: true, reason: null };
}

function getCompletedCountForShape(shape: ShapeType) {
  return completedTrials.value.filter((trial) => trial.shape === shape).length;
}

function isShapeComplete(shape: ShapeType) {
  const trials = shape === "circle" ? circleTrials.value : squareTrials.value;
  return trialIndices[shape] >= trials.length;
}

function resetTrialInteraction() {
  adjustableSize.value = REFERENCE_SIZE;
}

function onWindowKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.repeat) {
    return;
  }

  if (!isInitialized.value || !currentTrial.value || isExperimentComplete.value) {
    return;
  }

  event.preventDefault();
  confirmTrial();
}

function confirmTrial() {
  if (!isInitialized.value || !currentTrial.value) {
    return;
  }

  const actualAreaRatio = calculateAreaRatio(
    adjustableSize.value,
    REFERENCE_SIZE,
  );
  const xResult = computeX(currentTrial.value.targetRatio, actualAreaRatio);

  if (!xResult.valid) {
    alert(xResult.reason);

    return;
  }

  completedTrials.value.push({
    sessionId: currentSessionId.value,
    participantId: props.participant.id.trim(),
    timestamp: new Date().toISOString(),
    shape: currentTrial.value.shape,
    targetRatio: currentTrial.value.targetRatio,
    trialId: currentTrial.value.id,
    trialIndex: currentTrialIndex.value,
    referenceSize: REFERENCE_SIZE,
    finalSize: adjustableSize.value,
    actualAreaRatio,
    computedX: xResult.value,
  });

  trialIndices[activeMode.value] += 1;

  if (isShapeComplete(activeMode.value) && !isExperimentComplete.value) {
    activeMode.value = activeMode.value === "circle" ? "square" : "circle";
    return;
  }

  resetTrialInteraction();
}

function analyseResults() {
  if (!isInitialized.value || !isExperimentComplete.value) {
    return;
  }

  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    session: currentSession.value,
  };

  emit("completed", payload);
}
</script>

<style scoped>
.experiment-complete-card {
  background:
    radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.18), transparent 34%),
    linear-gradient(180deg, rgba(15, 27, 36, 0.96) 0%, rgba(11, 21, 29, 0.94) 100%);
  border-color: rgba(var(--v-theme-primary), 0.22);
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.32),
    0 0 0 1px rgba(var(--v-theme-primary), 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.experiment-complete-actions {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.16);
  border-radius: 24px;
  padding: 18px;
}

.analyse-results-btn {
  font-weight: 700;
  letter-spacing: 0.02em;
  min-width: 210px;
  text-transform: none;
}

.analyse-results-btn :deep(.v-btn__prepend) {
  margin-inline-end: 10px;
}

.analyse-results-btn:hover {
  transform: translateY(-1px);
}
</style>
