export const useDefaults = () => {
  function rectanglePath(size: number) {
    const side = size * 1.55;
    const half = side / 2;
    return `M ${-half} ${-half} H ${half} V ${half} H ${-half} Z`;
  }

  function polygonPath(sides: number, radius: number, rotation: number) {
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = ((360 / sides) * index + rotation) * (Math.PI / 180);
      return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
    });
    return `M ${points.join(" L ")} Z`;
  }

  function starPath(outerRadius: number, innerRadius: number, points: number) {
    const pathPoints = Array.from({ length: points * 2 }, (_, index) => {
      const radius = index % 2 === 0 ? outerRadius : innerRadius;
      const angle = ((180 / points) * index - 90) * (Math.PI / 180);
      return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
    });
    return `M ${pathPoints.join(" L ")} Z`;
  }

  return {
    polygonPath,
    rectanglePath,
    starPath,
  };
};
