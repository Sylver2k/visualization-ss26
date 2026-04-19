export const useDefaults = () => {
  const STAGES = [
    {
      id: "INTRO",
      label: "Intro",
    },
    {
      id: "PARTICIPANT",
      label: "Participant",
    },
    {
      id: "EXPERIMENT",
      label: "Experiment",
    },
    {
      id: "RESULTS",
      label: "Results",
    },
  ];

  const TARGET_RATIOS = [0.5, 0.75, 1.5, 2, 3, 4];

  const REFERENCE_SIZE = 78;

  return {
    STAGES,
    TARGET_RATIOS,
    REFERENCE_SIZE,
  };
};
