export type DatasetValue = string | number | null;

export type DatasetColumnType = "number" | "string";

export interface DatasetColumn {
  name: string;
  type: DatasetColumnType;
}

export type DatasetRow = Record<string, DatasetValue>;

export interface ParsedDataset {
  fileName: string;
  columns: DatasetColumn[];
  rows: DatasetRow[];
}
