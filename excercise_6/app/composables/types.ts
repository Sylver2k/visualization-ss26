
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export type BibleConnectionRow = {
  rootName: string;
  associatedName: string;
  weight: number;
};

export type GraphNode = SimulationNodeDatum & {
  id: string;
  name: string;
  degree: number;
};

export type GraphLink = SimulationLinkDatum<GraphNode> & {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
};

export type ParsedGraphDataset = {
  fileName: string;
  nodes: GraphNode[];
  links: GraphLink[];
  rows: BibleConnectionRow[];
  minWeight: number;
  maxWeight: number;
  minDegree: number;
  maxDegree: number;
};
