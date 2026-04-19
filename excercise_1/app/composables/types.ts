export type ShapeType = "circle" | "square";

export type Participant = {
  id: string;
  notes: string;
};

export type TrialDefinition = {
  id: string;
  shape: ShapeType;
  targetRatio: number;
  orderIndex: number;
};

export type TrialResult = {
  sessionId: string;
  participantId: string;
  timestamp: string;
  shape: ShapeType;
  targetRatio: number;
  trialId: string;
  trialIndex: number;
  referenceSize: number;
  finalSize: number;
  actualAreaRatio: number;
  computedX: number | null;
};

export type SessionResult = {
  sessionId: string;
  createdAt: string;
  participant: Participant;
  referenceSize: number;
  trials: TrialResult[];
};

export type ExportPayload = {
  version: number;
  exportedAt: string;
  session: SessionResult;
};

export type SummaryStats = {
  mean: number | null;
  count: number;
};

export type SessionRow = {
  sessionId: string;
  participantId: string;
  circleStats: SummaryStats;
  squareStats: SummaryStats;
  overallStats: SummaryStats;
};
