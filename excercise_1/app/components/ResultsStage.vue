<template>
  <div class="d-flex flex-column ga-4">
    <div class="d-flex flex-wrap ga-4">
      <v-card class="flex-grow-1" min-width="320" rounded="xl">
        <v-card-text class="d-flex flex-column ga-4">
          <div>
            <div class="text-overline">Summary</div>
            <h2 class="text-h5">Participant and aggregate results</h2>
            <p class="text-body-2">
              The table below summarizes all loaded sessions using trials with a
              computed <strong>x</strong> value.
            </p>
          </div>

          <div class="results-summary-grid">
            <div class="results-summary-grid__item">
              <span>Circle mean x</span>
              <strong>{{ formatNumber(aggregateCircleStats.mean) }}</strong>
            </div>
            <div class="results-summary-grid__item">
              <span>Square mean x</span>
              <strong>{{ formatNumber(aggregateSquareStats.mean) }}</strong>
            </div>
            <div class="results-summary-grid__item">
              <span>Overall mean x</span>
              <strong>{{ formatNumber(aggregateOverallStats.mean) }}</strong>
            </div>
            <div class="results-summary-grid__item">
              <span>Counted trials</span>
              <strong>{{ aggregateOverallStats.count }}</strong>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card min-width="320" rounded="xl">
        <v-card-text class="d-flex flex-column ga-4">
          <div>
            <div class="text-overline">Archive</div>
            <h2 class="text-h6">JSON import and export</h2>
          </div>

          <div class="d-flex flex-column ga-1 text-body-2">
            <div>Current session: {{ currentSessionLabel }}</div>
            <div>Imported sessions: {{ importedSessions.length }}</div>
            <div>Total analyzed sessions: {{ allSessions.length }}</div>
          </div>

          <div class="d-flex flex-wrap ga-3">
            <v-btn
              color="primary"
              prepend-icon="mdi-file-export"
              @click="exportJson"
            >
              Export JSON
            </v-btn>

            <v-btn
              color="secondary"
              prepend-icon="mdi-file-import"
              variant="outlined"
              @click="triggerImport"
            >
              Import JSON
            </v-btn>
          </div>

          <input
            ref="importInput"
            accept=".json,application/json"
            class="hidden-input"
            type="file"
            @change="importJson"
          />

          <p v-if="importMessage" class="text-body-2">
            {{ importMessage }}
          </p>
        </v-card-text>
      </v-card>
    </div>

    <v-card rounded="xl">
      <v-card-text class="d-flex flex-column ga-4">
        <div>
          <h3 class="text-h6">Participant summary table</h3>
          <p class="text-body-2">
            One row per loaded session, based on trials where
            <code>computedX</code>
            is available.
          </p>
        </div>

        <div class="table-shell">
          <v-table class="results-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Circle mean x</th>
                <th>Square mean x</th>
                <th>Overall mean x</th>
                <th>Trial count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in participantRows" :key="row.sessionId">
                <td>{{ row.participantId }}</td>
                <td>{{ formatNumber(row.circleStats.mean) }}</td>
                <td>{{ formatNumber(row.squareStats.mean) }}</td>
                <td>{{ formatNumber(row.overallStats.mean) }}</td>
                <td>{{ row.overallStats.count }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>

    <v-card rounded="xl">
      <v-card-text class="d-flex flex-column ga-4">
        <div>
          <h3 class="text-h6">Raw trial data</h3>
          <p class="text-body-2">
            This table includes all trials from the current session and imported
            sessions.
          </p>
        </div>

        <div class="table-shell">
          <v-table class="results-table results-table--compact" fixed-header height="480">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Shape</th>
                <th>Target ratio</th>
                <th>Actual ratio</th>
                <th>x</th>
                <th>Timestamp</th>
                <th>Trial index</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trial in allRawTrials"
                :key="`${trial.sessionId}-${trial.trialId}-${trial.trialIndex}-${trial.timestamp}`"
              >
                <td>{{ trial.participantId }}</td>
                <td>{{ trial.shape }}</td>
                <td>{{ trial.targetRatio }}</td>
                <td>{{ trial.actualAreaRatio.toFixed(3) }}</td>
                <td>{{ formatNumber(trial.computedX) }}</td>
                <td>{{ formatTimestamp(trial.timestamp) }}</td>
                <td>{{ trial.trialIndex }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  resultsPayload: {
    type: Object as PropType<ExportPayload>,
    required: true,
  },
});

const importedSessions = ref<SessionResult[]>([]);
const importMessage = ref("");
const importInput = ref<HTMLInputElement | null>(null);

const allSessions = computed(() => {
  const sessions = [props.resultsPayload.session, ...importedSessions.value];
  const deduped = new Map<string, SessionResult>();

  for (const session of sessions) {
    if (!deduped.has(session.sessionId)) {
      deduped.set(session.sessionId, session);
    }
  }

  return [...deduped.values()];
});

const allTrialsWithX = computed(() =>
  allSessions.value.flatMap((session) =>
    session.trials.filter((trial) => trial.computedX !== null),
  ),
);

const allRawTrials = computed(() =>
  allSessions.value.flatMap((session) => session.trials),
);

const aggregateCircleStats = computed(() =>
  calculateStats(
    allTrialsWithX.value.filter((trial) => trial.shape === "circle"),
  ),
);

const aggregateSquareStats = computed(() =>
  calculateStats(
    allTrialsWithX.value.filter((trial) => trial.shape === "square"),
  ),
);

const aggregateOverallStats = computed(() =>
  calculateStats(allTrialsWithX.value),
);

const participantRows = computed<SessionRow[]>(() =>
  allSessions.value.map((session) => {
    const trialsWithX = session.trials.filter(
      (trial) => trial.computedX !== null,
    );

    return {
      sessionId: session.sessionId,
      participantId: session.participant.id,
      circleStats: calculateStats(
        trialsWithX.filter((trial) => trial.shape === "circle"),
      ),
      squareStats: calculateStats(
        trialsWithX.filter((trial) => trial.shape === "square"),
      ),
      overallStats: calculateStats(trialsWithX),
    };
  }),
);

const currentSessionLabel = computed(() => {
  const participantId = props.resultsPayload.session.participant.id.trim();
  return participantId || props.resultsPayload.session.sessionId;
});

function calculateStats(trials: TrialResult[]): SummaryStats {
  const values = trials
    .filter(
      (trial): trial is TrialResult & { computedX: number } =>
        trial.computedX !== null,
    )
    .map((trial) => trial.computedX);

  if (!values.length) {
    return {
      mean: null,
      count: 0,
    };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    mean,
    count: values.length,
  };
}

function formatNumber(value: number | null, digits = 3) {
  return value === null ? "-" : value.toFixed(digits);
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  downloadFile(
    `perceived-area-session-${Date.now()}.json`,
    JSON.stringify(props.resultsPayload, null, 2),
    "application/json",
  );
}

function triggerImport() {
  importInput.value?.click();
}

async function importJson(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as ExportPayload;

    const existingIds = new Set(
      allSessions.value.map((session) => session.sessionId),
    );

    if (existingIds.has(parsed.session.sessionId)) {
      importMessage.value = "This session is already loaded.";
      return;
    }

    importedSessions.value = [...importedSessions.value, parsed.session];
    importMessage.value = `Imported session ${parsed.session.participant.id}.`;
  } catch {
    importMessage.value = "Import failed. The selected file could not be read.";
  } finally {
    input.value = "";
  }
}
</script>

<style scoped>
.hidden-input {
  display: none;
}

.results-summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.results-summary-grid__item {
  border: 1px solid rgb(var(--v-theme-surface-variant));
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
}

.results-summary-grid__item span {
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.875rem;
}

.results-summary-grid__item strong {
  font-size: 1.35rem;
}

.table-shell {
  overflow-x: auto;
}

.results-table {
  min-width: 720px;
  width: 100%;
}

.results-table :deep(th),
.results-table :deep(td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding: 12px 14px;
  text-align: left;
  vertical-align: top;
}

.results-table :deep(th) {
  background: rgba(var(--v-theme-primary), 0.08);
  font-size: 0.875rem;
  font-weight: 600;
}

.results-table--compact :deep(th),
.results-table--compact :deep(td) {
  font-size: 0.9rem;
  padding: 10px 12px;
}
</style>
