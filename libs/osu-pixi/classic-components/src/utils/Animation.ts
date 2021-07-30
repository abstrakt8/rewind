export function animationIndex(time: number, animationFrameRate = 60) {
  const eachFrameMs = 1000 / animationFrameRate;
  return Math.floor(time / eachFrameMs);
}
