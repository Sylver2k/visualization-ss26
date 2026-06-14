import type {
  DatasetColumn,
  DatasetColumnType,
  DatasetRow,
  DatasetValue,
  ParsedDataset,
} from "./types";

const MISSING_VALUES = new Set(["", "NA"]);

export async function parseDatasetFile(file: File): Promise<ParsedDataset> {
  if (!file.name.toLowerCase().endsWith(".tsv")) {
    throw new Error("The selected dataset must be a TSV file.");
  }

  return parseDatasetTsv(await file.text(), file.name);
}

export function parseDatasetTsv(
  tsv: string,
  fileName = "dataset.tsv",
): ParsedDataset {
  const lines = tsv
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\n|\r/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("The dataset must contain a header and at least one row.");
  }

  const headers = parseTsvLine(lines[0] ?? "").map((header) => header.trim());
  validateHeaders(headers);

  const rawRows = lines.slice(1).map((line, rowIndex) => {
    const values = parseTsvLine(line);

    if (values.length > headers.length) {
      throw new Error(
        `Row ${rowIndex + 2} contains more values than the header.`,
      );
    }

    return headers.map((_, columnIndex) => values[columnIndex]?.trim() ?? "");
  });

  const columns: DatasetColumn[] = headers.map((name, columnIndex) => ({
    name,
    type: inferColumnType(rawRows.map((row) => row[columnIndex] ?? "")),
  }));

  const rows: DatasetRow[] = rawRows.map((rawRow) =>
    Object.fromEntries(
      columns.map((column, columnIndex) => [
        column.name,
        parseValue(rawRow[columnIndex] ?? "", column.type),
      ]),
    ),
  );

  return {
    fileName,
    columns,
    rows,
  };
}

function validateHeaders(headers: string[]) {
  if (headers.some((header) => header.length === 0)) {
    throw new Error("Every dataset column must have a name.");
  }

  if (new Set(headers).size !== headers.length) {
    throw new Error("Dataset column names must be unique.");
  }
}

function inferColumnType(values: string[]): DatasetColumnType {
  const presentValues = values.filter((value) => !isMissing(value));

  if (
    presentValues.length > 0 &&
    presentValues.every((value) => isNumeric(value))
  ) {
    return "number";
  }

  return "string";
}

function parseValue(value: string, type: DatasetColumnType): DatasetValue {
  if (isMissing(value)) {
    return null;
  }

  return type === "number" ? Number(value) : value;
}

function isMissing(value: string) {
  return MISSING_VALUES.has(value.toUpperCase());
}

function isNumeric(value: string) {
  return value.length > 0 && Number.isFinite(Number(value));
}

function parseTsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "\t" && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) {
    throw new Error("The dataset contains an unterminated quoted value.");
  }

  values.push(value);
  return values;
}
