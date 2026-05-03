export type Feature = "color" | "shape" | "size" | "diagonal";

export type Diversity = "low" | "medium" | "high";

export type Side = "left" | "right" | "none";

export type Stage =
  | "setup"
  | "ready"
  | "stimulus"
  | "answer"
  | "feedback"
  | "results";

export type Shape = "circle" | "square" | "triangle" | "diamond" | "bar";

export type ExperimentSettings = {
  feature: Feature;
  displayMs: number;
  conjunction: boolean;
  diversity: Diversity;
  itemCount: number;
  trials: number;
};

export type StimulusItem = {
  shape: Shape;
  color: string;
  size: number;
  rotation: number;
};

export type Stimulus = {
  left: StimulusItem[];
  right: StimulusItem[];
  targetSide: Side;
};

export type TrialResult = {
  trial: number;
  targetSide: Side;
  answer: Side;
  correct: boolean;
};
