<template>
  <main class="cars-page">
    <section class="toolbar">
      <div>
        <h1>Car Dataset Visualization</h1>
      </div>

      <div class="controls">
        <v-select
          v-model="selectedMetricKey"
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
          color="primary"
          density="comfortable"
          hide-details
          label="Hide missing values"
        />
      </div>
    </section>

    <v-alert v-if="error" class="mb-4" type="error" variant="tonal">
      The car dataset could not be loaded.
    </v-alert>

    <section v-else class="workspace">
      <div class="chart-column">
        <div
          class="chart-meta text-body-2 font-weight-bold text-medium-emphasis"
        >
          <span>{{ filteredCars.length }} cars</span>
          <span>{{ manufacturerCount }} manufacturers</span>
          <span>{{ selectedMetric.sourceLabel }} on Y axis</span>
        </div>

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
  background: #f4f7fb;
  min-height: 100vh;
  padding: 28px;
}

.toolbar {
  align-items: end;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin: 0 auto 20px;
  max-width: 1480px;
}

h1 {
  line-height: 1;
  margin: 0;
}

.controls {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: flex-end;
}

.workspace {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) 320px;
  margin: 0 auto;
  max-width: 1480px;
}

.chart-column {
  min-width: 0;
}

.chart-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-meta span {
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 999px;
  padding: 6px 10px;
}

.panel-block {
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  padding: 18px;
}

h2 {
  margin: 0 0 16px;
}

h3 {
  margin: 0 0 8px;
}

.legend-section + .legend-section {
  margin-top: 18px;
}

.legend-row {
  align-items: center;
  display: flex;
  gap: 10px;
  min-height: 30px;
}

.color-swatch {
  border: 1px solid #182230;
  border-radius: 50%;
  display: inline-block;
  height: 18px;
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
  border: 1.6px solid #182230;
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
