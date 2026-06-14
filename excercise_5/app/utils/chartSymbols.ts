import {
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
} from "d3";
import type { DatasetColumn, DatasetRow } from "../composables/types";

export const chartSymbolTypes = [
  symbolCircle,
  symbolSquare,
  symbolTriangle,
  symbolDiamond,
  symbolStar,
  symbolCross,
  symbolWye,
];

export const chartSymbolCount = chartSymbolTypes.length;

export function getShapeAttributes(
  columns: DatasetColumn[],
  rows: DatasetRow[],
) {
  return columns
    .map((column) => ({
      name: column.name,
      distinctValueCount: new Set(
        rows.map((row) => String(row[column.name] ?? "NA")),
      ).size,
    }))
    .filter(
      (attribute) =>
        attribute.distinctValueCount >= 2 &&
        attribute.distinctValueCount <= chartSymbolCount,
    )
    .sort(
      (first, second) => first.distinctValueCount - second.distinctValueCount,
    );
}
