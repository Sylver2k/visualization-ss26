import type { CarRecord, MetricConfig, MetricKey, Origin } from "./types";

const LITERS_PER_100KM_FACTOR = 235.214583;
const CCM_PER_CUBIC_INCH = 16.387;
const KG_PER_POUND = 0.4536;

export const metricConfigs: MetricConfig[] = [
  {
    key: "fuelConsumptionL100km",
    label: "Fuel consumption",
    unit: "l/100 km",
    sourceLabel: "MPG",
    format: (value) => (value === null ? "NA" : `${value.toFixed(1)} l/100 km`),
  },
  {
    key: "displacementCcm",
    label: "Displacement",
    unit: "cm3",
    sourceLabel: "Displacement",
    format: (value) => (value === null ? "NA" : `${Math.round(value)} cm3`),
  },
  {
    key: "horsepower",
    label: "Horsepower",
    unit: "hp",
    sourceLabel: "Horsepower",
    format: (value) => (value === null ? "NA" : `${Math.round(value)} hp`),
  },
  {
    key: "acceleration",
    label: "Acceleration 0-60 mph",
    unit: "s",
    sourceLabel: "Acceleration",
    format: (value) => (value === null ? "NA" : `${value.toFixed(1)} s`),
  },
];

export function useCars() {
  return useAsyncData("cars-tsv", async () => {
    const tsv = await $fetch<string>("/data/cars.tsv", {
      responseType: "text",
    });
    return parseCarsTsv(tsv);
  }, {
    server: false,
  });
}

export function metricConfigByKey(key: MetricKey) {
  return metricConfigs.find((metric) => metric.key === key) ?? metricConfigs[0];
}

export function parseCarsTsv(tsv: string): CarRecord[] {
  const [headerLine, ...lines] = tsv.trim().split(/\r?\n/);
  const headers = headerLine.split("\t");

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const values = line.split("\t");
      const row = Object.fromEntries(
        headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""]),
      );

      const mpg = nullableNumber(row.MPG);
      const displacement = requiredNumber(row.Displacement);
      const weight = requiredNumber(row.Weight);
      const horsepower = nullableNumber(row.Horsepower);

      return {
        id: `${row.Manufacturer}-${row.Car}-${row["Model Year"]}-${index}`,
        car: row.Car,
        manufacturer: row.Manufacturer,
        mpg,
        fuelConsumptionL100km:
          mpg === null ? null : LITERS_PER_100KM_FACTOR / mpg,
        cylinders: requiredNumber(row.Cylinders),
        displacement,
        displacementCcm: displacement * CCM_PER_CUBIC_INCH,
        horsepower,
        weight,
        weightKg: weight * KG_PER_POUND,
        acceleration: requiredNumber(row.Acceleration),
        modelYear: requiredNumber(row["Model Year"]),
        origin: row.Origin as Origin,
      };
    });
}

function nullableNumber(value: string) {
  if (value === "NA" || value === "") {
    return null;
  }
  return Number(value);
}

function requiredNumber(value: string) {
  return Number(value);
}
