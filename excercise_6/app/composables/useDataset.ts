import type {
  BibleConnectionRow,
  GraphLink,
  GraphNode,
  ParsedGraphDataset,
} from "./types";

export async function loadGraphDataset(
  datasetPath: string,
): Promise<ParsedGraphDataset> {
  const response = await fetch(datasetPath);

  if (!response.ok) {
    throw new Error(`Could not load dataset from ${datasetPath}.`);
  }

  return parseGraphDatasetTsv(
    await response.text(),
    fileNameFromPath(datasetPath),
  );
}

export function parseGraphDatasetTsv(
  tsv: string,
  fileName = "dataset.tsv",
): ParsedGraphDataset {
  const lines = tsv
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\n|\r/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("The dataset must contain a header and at least one row.");
  }

  const headers = parseTsvLine(lines[0] ?? "").map((header) => header.trim());

  const rows = lines
    .slice(1)
    .map((line, index) => parseConnectionRow(line, headers, index + 2));

  return prepareGraphDataset(rows, fileName);
}

export function prepareGraphDataset(
  rows: BibleConnectionRow[],
  fileName = "dataset.tsv",
): ParsedGraphDataset {
  if (rows.length === 0) {
    throw new Error("The dataset must contain at least one connection.");
  }

  const nodeNames = new Set<string>();
  const neighborsByName = new Map<string, Set<string>>();

  rows.forEach((row) => {
    nodeNames.add(row.rootName);
    nodeNames.add(row.associatedName);
    addNeighbor(neighborsByName, row.rootName, row.associatedName);
    addNeighbor(neighborsByName, row.associatedName, row.rootName);
  });

  const nodes: GraphNode[] = Array.from(nodeNames)
    .sort((left, right) => left.localeCompare(right))
    .map((name) => ({
      id: name,
      name,
      degree: neighborsByName.get(name)?.size ?? 0,
    }));

  const links: GraphLink[] = rows.map((row) => ({
    source: row.rootName,
    target: row.associatedName,
    weight: row.weight,
  }));

  const weights = rows.map((row) => row.weight);
  const degrees = nodes.map((node) => node.degree);

  return {
    fileName,
    nodes,
    links,
    rows,
    minWeight: Math.min(...weights),
    maxWeight: Math.max(...weights),
    minDegree: Math.min(...degrees),
    maxDegree: Math.max(...degrees),
  };
}

function parseConnectionRow(
  line: string,
  headers: string[],
  rowNumber: number,
): BibleConnectionRow {
  const values = parseTsvLine(line);

  if (values.length > headers.length) {
    throw new Error(`Row ${rowNumber} contains more values than the header.`);
  }

  const row = Object.fromEntries(
    headers.map((header, index) => [header, values[index]?.trim() ?? ""]),
  );
  const rootName = row["Root Name"];
  const associatedName = row["Associated Name"];
  const rawWeight = row["Association Weight"];
  const weight = Number(rawWeight);

  if (!rootName || !associatedName) {
    throw new Error(`Row ${rowNumber} must contain two person names.`);
  }

  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`Row ${rowNumber} has an invalid association weight.`);
  }

  return {
    rootName,
    associatedName,
    weight,
  };
}

function addNeighbor(
  neighborsByName: Map<string, Set<string>>,
  name: string,
  neighbor: string,
) {
  const neighbors = neighborsByName.get(name) ?? new Set<string>();
  neighbors.add(neighbor);
  neighborsByName.set(name, neighbors);
}

function fileNameFromPath(path: string) {
  return path.split("/").filter(Boolean).at(-1) ?? "dataset.tsv";
}

function parseTsvLine(line: string) {
  return line.split("\t");
}
