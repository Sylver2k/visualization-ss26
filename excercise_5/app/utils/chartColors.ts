import { schemeTableau10 } from "d3";
import type {
  DatasetColumn,
  DatasetRow,
} from "../composables/types";

export const categoricalColorCount = schemeTableau10.length;

export function getColorAttributes(
  columns: DatasetColumn[],
  rows: DatasetRow[],
) {
  return columns
    .map((column) => ({
      name: column.name,
      type: column.type,
      distinctValueCount: new Set(
        rows.map((row) => String(row[column.name] ?? "NA")),
      ).size,
    }))
    .filter(
      (attribute) =>
        attribute.type === "number" ||
        (attribute.distinctValueCount >= 2 &&
          attribute.distinctValueCount <= categoricalColorCount),
    );
}
