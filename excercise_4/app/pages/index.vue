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
        <div class="chart-meta">
          <span>{{ cars?.length ?? 0 }} cars</span>
          <span>{{ manufacturerCount }} manufacturers</span>
          <span>{{ selectedMetric.sourceLabel }} on Y axis</span>
        </div>

        <car-glyph-chart
          v-if="cars"
          :active-car="activeCar"
          :cars="cars"
          :hide-missing="hideMissing"
          :metric="selectedMetric"
          @hover="hoveredCar = $event"
          @select="selectCar"
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
            <p>Heavier cars use larger glyphs.</p>
          </div>
        </section>

        <section class="panel-block details-block">
          <h2>Car details</h2>
          <div v-if="activeCar" class="details">
            <div>
              <p class="detail-title">
                {{ titleCase(activeCar.manufacturer) }} {{ activeCar.car }}
              </p>
              <p class="detail-subtitle">
                Model year 19{{
                  activeCar.modelYear.toString().padStart(2, "0")
                }}
              </p>
            </div>

            <dl>
              <div
                v-for="detail in detailRows"
                :key="detail.label"
                :class="{ highlighted: detail.highlighted }"
              >
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value }}</dd>
              </div>
            </dl>
          </div>
          <p v-else class="empty-details">
            Hover or click a glyph to inspect one car.
          </p>
        </section>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
const selectedMetricKey = ref<MetricKey>("fuelConsumptionL100km");
const hideMissing = ref(false);
const selectedCar = ref<CarRecord | null>(null);
const hoveredCar = ref<CarRecord | null>(null);

const { data: cars, error } = await useCars();
const { polygonPath, starPath, rectanglePath } = useDefaults();

const selectedMetric = computed(() =>
  metricConfigByKey(selectedMetricKey.value),
);
const activeCar = computed(() => hoveredCar.value ?? selectedCar.value);

const manufacturerCount = computed(() => {
  if (!cars.value) {
    return 0;
  }
  return new Set(cars.value.map((car) => car.manufacturer)).size;
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

const detailRows = computed(() => {
  const car = activeCar.value;
  if (!car) {
    return [];
  }

  return [
    {
      label: "Origin",
      value: car.origin,
      highlighted: false,
    },
    {
      label: "Cylinders",
      value: car.cylinders.toString(),
      highlighted: false,
    },
    {
      label: "Fuel consumption",
      value: `${selectedMetric.value.key === "fuelConsumptionL100km" ? selectedMetric.value.format(car.fuelConsumptionL100km) : formatNullable(car.fuelConsumptionL100km, 1, "l/100 km")} (${formatNullable(car.mpg, 1, "MPG")})`,
      highlighted: selectedMetric.value.key === "fuelConsumptionL100km",
    },
    {
      label: "Displacement",
      value: `${Math.round(car.displacementCcm)} cm3 (${Math.round(car.displacement)} cubic in)`,
      highlighted: selectedMetric.value.key === "displacementCcm",
    },
    {
      label: "Horsepower",
      value: formatNullable(car.horsepower, 0, "hp"),
      highlighted: selectedMetric.value.key === "horsepower",
    },
    {
      label: "Weight",
      value: `${Math.round(car.weightKg)} kg (${Math.round(car.weight)} lbs)`,
      highlighted: false,
    },
    {
      label: "Acceleration",
      value: `${car.acceleration.toFixed(1)} s`,
      highlighted: selectedMetric.value.key === "acceleration",
    },
  ];
});

function selectCar(car: CarRecord) {
  selectedCar.value = car;
}

function formatNullable(value: number | null, digits: number, unit: string) {
  if (value === null) {
    return "NA";
  }
  return `${value.toFixed(digits)} ${unit}`;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
</script>

<style scoped>
.cars-page {
  background: #f4f7fb;
  color: #182230;
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
  font-size: clamp(2rem, 4vw, 3.5rem);
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
  color: #596579;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.9rem;
  font-weight: 700;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-meta span {
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 999px;
  padding: 6px 10px;
}

.side-panel {
  display: grid;
  gap: 18px;
}

.panel-block {
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  padding: 18px;
}

h2 {
  font-size: 1.15rem;
  margin: 0 0 16px;
}

h3 {
  color: #596579;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0 0 8px;
  text-transform: uppercase;
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

.legend-section p,
.empty-details {
  color: #64748b;
  font-size: 0.92rem;
  margin: 8px 0 0;
}

.details {
  display: grid;
  gap: 16px;
}

.detail-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
}

.detail-subtitle {
  color: #64748b;
  margin: 2px 0 0;
}

dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

dl div {
  border: 1px solid #e3e8f1;
  border-radius: 8px;
  display: grid;
  gap: 4px;
  padding: 10px;
}

dl div.highlighted {
  background: #fff7d6;
  border-color: #eab308;
}

dt {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

dd {
  margin: 0;
}
</style>
