export type Origin = "American" | "European" | "Japanese";

export type MetricKey =
  | "fuelConsumptionL100km"
  | "displacementCcm"
  | "horsepower"
  | "acceleration";

export interface CarRecord {
  id: string;
  car: string;
  manufacturer: string;
  mpg: number | null;
  fuelConsumptionL100km: number | null;
  cylinders: number;
  displacement: number;
  displacementCcm: number;
  horsepower: number | null;
  weight: number;
  weightKg: number;
  acceleration: number;
  modelYear: number;
  origin: Origin;
}

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  sourceLabel: string;
  format: (value: number | null) => string;
}
