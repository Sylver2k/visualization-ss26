<template>
  <div class="chart-shell">
    <div class="chart-scroll">
      <svg
        class="chart-svg"
        :height="chartHeight"
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        :width="chartWidth"
        role="img"
        :aria-label="`Car glyph chart by manufacturer and ${metric.label}`"
        @mouseleave="emit('hover', null)"
      >
        <rect
          :height="chartHeight"
          rx="0"
          width="100%"
          class="chart-background"
        />

        <g class="grid-lines">
          <line
            v-for="tick in yTicks"
            :key="tick"
            :x1="margin.left"
            :x2="chartWidth - margin.right"
            :y1="yScale(tick)"
            :y2="yScale(tick)"
          />
        </g>

        <g class="axes">
          <line
            :x1="margin.left"
            :x2="chartWidth - margin.right"
            :y1="baselineY"
            :y2="baselineY"
          />
          <line
            :x1="margin.left"
            :x2="margin.left"
            :y1="margin.top"
            :y2="naBandY + 28"
          />
          <text class="axis-title" :x="margin.left" y="24">
            {{ metric.label }} ({{ metric.unit }})
          </text>
          <text
            class="axis-title x-title"
            :x="chartWidth - margin.right"
            :y="chartHeight - 12"
          >
            Manufacturer
          </text>
          <text
            v-for="tick in yTicks"
            :key="`label-${tick}`"
            class="tick-label"
            :x="margin.left - 12"
            :y="yScale(tick) + 4"
          >
            {{ formatTick(tick) }}
          </text>
          <text class="tick-label" :x="margin.left - 12" :y="naBandY + 4">
            NA
          </text>
          <line
            class="na-divider"
            :x1="margin.left"
            :x2="chartWidth - margin.right"
            :y1="naBandY - 30"
            :y2="naBandY - 30"
          />
          <text class="na-label" :x="margin.left + 12" :y="naBandY - 38">
            Missing selected values
          </text>
        </g>

        <g class="x-axis-labels">
          <g
            v-for="manufacturer in manufacturers"
            :key="manufacturer"
            :transform="`translate(${manufacturerX(manufacturer)}, ${baselineY + 20})`"
          >
            <line y1="-8" y2="0" />
            <text transform="rotate(38)" x="4" y="18">
              {{ manufacturer }}
            </text>
          </g>
        </g>

        <g class="glyphs">
          <g
            v-for="point in positionedCars"
            :key="point.car.id"
            class="glyph-hit-area"
            :class="{ active: activeCar?.id === point.car.id }"
            :transform="`translate(${point.x}, ${point.y})`"
            tabindex="0"
            role="button"
            :aria-label="`${point.car.manufacturer} ${point.car.car}`"
            @click="emit('select', point.car)"
            @focus="emit('hover', point.car)"
            @mouseenter="emit('hover', point.car)"
          >
            <circle class="glyph-target" :r="point.size + 8" />
            <path
              class="glyph"
              :d="shapePath(point.car.cylinders, point.size)"
              :fill="originColor(point.car.origin)"
            />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  cars: CarRecord[];
  metric: MetricConfig;
  hideMissing: boolean;
  activeCar: CarRecord | null;
}>();

const { polygonPath, starPath, rectanglePath } = useDefaults();

const emit = defineEmits<{
  hover: [car: CarRecord | null];
  select: [car: CarRecord];
}>();

const margin = {
  top: 52,
  right: 44,
  bottom: 120,
  left: 82,
};
const manufacturerStep = 96;
const chartHeight = 620;
const baselineY = 442;
const naBandY = 516;
const plotHeight = baselineY - margin.top;

const manufacturers = computed(() =>
  [...new Set(props.cars.map((car) => car.manufacturer))].sort((a, b) =>
    a.localeCompare(b),
  ),
);

const chartWidth = computed(
  () =>
    margin.left + margin.right + manufacturers.value.length * manufacturerStep,
);

const visibleCars = computed(() =>
  props.hideMissing
    ? props.cars.filter((car) => metricValue(car) !== null)
    : props.cars,
);

const metricValues = computed(() =>
  props.cars
    .map((car) => metricValue(car))
    .filter((value): value is number => value !== null),
);

const yMax = computed(() => {
  const max = Math.max(...metricValues.value, 1);
  return niceCeil(max * 1.1);
});

const yTicks = computed(() => {
  const ticks = 5;
  return Array.from(
    { length: ticks + 1 },
    (_, index) => (yMax.value / ticks) * index,
  );
});

const weightRange = computed(() => {
  const weights = props.cars.map((car) => car.weightKg);
  return {
    min: Math.min(...weights),
    max: Math.max(...weights),
  };
});

const positionedCars = computed(() => {
  const groups = new Map<string, CarRecord[]>();

  for (const car of visibleCars.value) {
    const value = metricValue(car);
    const yBucket = value === null ? "NA" : Math.round(yScale(value) / 12);
    const key = `${car.manufacturer}-${yBucket}`;
    groups.set(key, [...(groups.get(key) ?? []), car]);
  }

  const offsets = new Map<string, number>();
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.car.localeCompare(b.car));
    sorted.forEach((car, index) => {
      const centered = index - (sorted.length - 1) / 2;
      offsets.set(car.id, centered * 13);
    });
  }

  return visibleCars.value.map((car) => {
    const value = metricValue(car);
    return {
      car,
      size: weightSize(car.weightKg),
      x: manufacturerX(car.manufacturer) + (offsets.get(car.id) ?? 0),
      y: value === null ? naBandY : yScale(value),
    };
  });
});

function metricValue(car: CarRecord) {
  return car[props.metric.key];
}

function manufacturerX(manufacturer: string) {
  const index = manufacturers.value.indexOf(manufacturer);
  return margin.left + manufacturerStep * index + manufacturerStep / 2;
}

function yScale(value: number) {
  return baselineY - (value / yMax.value) * plotHeight;
}

function weightSize(weightKg: number) {
  const { min, max } = weightRange.value;
  if (max === min) {
    return 10;
  }
  return 6 + ((weightKg - min) / (max - min)) * 14;
}

function originColor(origin: CarRecord["origin"]) {
  switch (origin) {
    case "European":
      return "#2563eb";
    case "Japanese":
      return "#facc15";
    default:
      return "#dc2626";
  }
}

function shapePath(cylinders: number, size: number) {
  switch (cylinders) {
    case 3:
      return polygonPath(18, size, -90);
    case 4:
      return starPath(size, size * 0.46, 5);
    case 5:
      return rectanglePath(size);
    case 6:
      return polygonPath(5, size, -90);
    case 8:
      return polygonPath(3, size * 1.08, -90);
    default:
      return polygonPath(18, size, -90);
  }
}

function niceCeil(value: number) {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatTick(value: number) {
  if (
    props.metric.key === "fuelConsumptionL100km" ||
    props.metric.key === "acceleration"
  ) {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
}
</script>

<style scoped>
.chart-shell {
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  overflow: hidden;
}

.chart-scroll {
  overflow-x: auto;
  overflow-y: hidden;
}

.chart-svg {
  display: block;
  min-width: 100%;
}

.chart-background {
  fill: #fbfcff;
}

.grid-lines line {
  stroke: #e5e9f2;
  stroke-width: 1;
}

.axes line {
  stroke: #293241;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.axes .na-divider {
  stroke: #aab4c5;
  stroke-dasharray: 6 8;
  stroke-width: 1.2;
}

.axis-title {
  fill: #182230;
  font-size: 15px;
  font-weight: 700;
}

.x-title {
  text-anchor: end;
}

.tick-label,
.na-label,
.x-axis-labels text {
  fill: #596579;
  font-size: 12px;
}

.tick-label {
  text-anchor: end;
}

.x-axis-labels line {
  stroke: #293241;
  stroke-width: 1.3;
}

.glyph-hit-area {
  cursor: pointer;
  outline: none;
}

.glyph-target {
  fill: transparent;
}

.glyph {
  stroke: #182230;
  stroke-linejoin: round;
  stroke-width: 1.6;
  transition:
    filter 140ms ease,
    stroke-width 140ms ease,
    transform 140ms ease;
}

.glyph-hit-area:hover .glyph,
.glyph-hit-area:focus-visible .glyph,
.glyph-hit-area.active .glyph {
  filter: drop-shadow(0 8px 12px rgba(24, 34, 48, 0.2));
  stroke-width: 2.8;
  transform: scale(1.08);
}
</style>
