<template>
  <main class="cars-page">
    <section class="page-header">
      <div class="title-block">
        <p class="page-kicker text-caption text-medium-emphasis">
          Automotive dataset
        </p>
        <h1>Car Dataset Visualization</h1>
        <p class="page-subtitle text-body-2 text-medium-emphasis">
          Model years 1970-1982
        </p>
      </div>
    </section>

    <v-alert v-if="error" class="mb-4" type="error" variant="tonal">
      The car dataset could not be loaded.
    </v-alert>

    <section v-else class="visualization-area">
      <div class="chart-toolbar">
        <div
          class="chart-meta text-body-2 font-weight-bold text-medium-emphasis"
        >
          <span>
            <v-icon icon="mdi-car-side" size="16" />
            {{ filteredCars.length }} cars
          </span>
          <span>
            <v-icon icon="mdi-domain" size="16" />
            {{ manufacturerCount }} manufacturers
          </span>
          <span>
            <v-icon icon="mdi-chart-line" size="16" />
            {{ selectedMetric.sourceLabel }} on Y axis
          </span>
        </div>

        <div class="controls-panel">
          <v-select
            v-model="selectedMetricKey"
            class="metric-select"
            density="comfortable"
            hide-details
            item-title="label"
            item-value="key"
            :items="metricConfigs"
            label="Y axis"
            min-width="260"
            variant="outlined"
          />
          <manufacturer-filter
            v-model="selectedManufacturers"
            :options="manufacturerOptions"
          />
          <v-checkbox
            v-model="hideMissing"
            class="missing-checkbox"
            color="primary"
            density="comfortable"
            hide-details
            label="Hide missing values"
          />
        </div>
      </div>

      <div class="workspace">
        <div class="chart-column">
          <car-glyph-chart
            v-if="cars"
            :cars="filteredCars"
            :hide-missing="hideMissing"
            :metric="selectedMetric"
          />
        </div>

        <aside class="side-panel">
          <section class="panel-block">
            <h2>Legend</h2>

            <div class="legend-section">
              <h3>Origin color</h3>
              <div
                v-for="origin in originLegend"
                :key="origin.label"
                class="legend-row"
              >
                <span
                  class="color-swatch"
                  :style="{ backgroundColor: origin.color }"
                />
                <span>{{ origin.label }}</span>
              </div>
            </div>

            <div class="legend-section">
              <h3>Cylinder shape</h3>
              <div
                v-for="shape in cylinderLegend"
                :key="shape.label"
                class="legend-row"
              >
                <svg
                  height="28"
                  viewBox="-16 -16 32 32"
                  width="28"
                  aria-hidden="true"
                >
                  <path
                    :d="shape.path"
                    fill="#eef2ff"
                    stroke="#182230"
                    stroke-width="1.8"
                  />
                </svg>
                <span>{{ shape.label }}</span>
              </div>
            </div>

            <div class="legend-section">
              <h3>Weight size</h3>
              <div class="weight-demo">
                <span class="weight-dot small" />
                <span class="weight-dot medium" />
                <span class="weight-dot large" />
              </div>
              <p class="text-body-2 text-medium-emphasis">
                Heavier cars use larger glyphs.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const selectedMetricKey = ref<MetricKey>("fuelConsumptionL100km");
const selectedManufacturers = ref<string[]>([]);
const hideMissing = ref(false);

const { data: cars, error } = await useCars();
const { polygonPath, starPath, rectanglePath } = useDefaults();

const selectedMetric = computed(() =>
  metricConfigByKey(selectedMetricKey.value),
);

const manufacturerOptions = computed(() =>
  [...new Set((cars.value ?? []).map((car) => car.manufacturer))].sort((a, b) =>
    a.localeCompare(b),
  ),
);

const filteredCars = computed(() => {
  const selected = new Set(selectedManufacturers.value);
  return (cars.value ?? []).filter((car) => selected.has(car.manufacturer));
});

const manufacturerCount = computed(() => {
  return new Set(filteredCars.value.map((car) => car.manufacturer)).size;
});

const originLegend = [
  { label: "American", color: "#dc2626" },
  { label: "European", color: "#2563eb" },
  { label: "Japanese", color: "#facc15" },
];

const cylinderLegend = [
  { label: "3 cylinders", path: polygonPath(18, 9, -90) },
  { label: "4 cylinders", path: starPath(11, 5.2, 5) },
  { label: "5 cylinders", path: rectanglePath(9) },
  { label: "6 cylinders", path: polygonPath(5, 10, -90) },
  { label: "8 cylinders", path: polygonPath(3, 11, -90) },
];
</script>

<style scoped>
.cars-page {
  background: #f3f6fa;
  min-height: 100vh;
  padding: 32px;
}

.page-header {
  margin: 0 auto;
  max-width: 1480px;
}

.title-block {
  min-width: 280px;
}

.page-kicker {
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

h1 {
  color: #172033;
  line-height: 1;
  margin: 0;
}

.page-subtitle {
  margin: 8px 0 0;
}

.controls-panel {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dce3ed;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(50, 65, 90, 0.06);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  padding: 10px 12px;
}

.metric-select {
  min-width: 240px;
}

.missing-checkbox {
  margin-inline-start: 2px;
}

.visualization-area {
  margin: 0 auto;
  max-width: 1480px;
}

.chart-toolbar {
  align-items: flex-end;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.workspace {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) 320px;
}

.chart-column {
  min-width: 0;
}

.chart-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-meta span {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dce3ed;
  border-radius: 999px;
  display: inline-flex;
  gap: 6px;
  padding: 6px 11px;
}

.panel-block {
  background: #ffffff;
  border: 1px solid #dce3ed;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(50, 65, 90, 0.06);
  padding: 20px;
}

h2 {
  margin: 0 0 16px;
}

h3 {
  margin: 0 0 8px;
}

.legend-section + .legend-section {
  border-top: 1px solid #eef1f5;
  margin-top: 18px;
  padding-top: 18px;
}

.legend-row {
  align-items: center;
  display: flex;
  gap: 10px;
  min-height: 30px;
}

.color-swatch {
  border: 1px solid rgba(23, 32, 51, 0.72);
  border-radius: 50%;
  display: inline-block;
  height: 18px;
  box-shadow: 0 2px 4px rgba(50, 65, 90, 0.12);
  width: 18px;
}

.weight-demo {
  align-items: center;
  display: flex;
  gap: 12px;
  min-height: 42px;
}

.weight-dot {
  background: #dbeafe;
  border: 1.6px solid #334155;
  border-radius: 50%;
  display: inline-block;
}

.weight-dot.small {
  height: 14px;
  width: 14px;
}

.weight-dot.medium {
  height: 24px;
  width: 24px;
}

.weight-dot.large {
  height: 36px;
  width: 36px;
}

.legend-section p {
  margin: 8px 0 0;
}
</style>
