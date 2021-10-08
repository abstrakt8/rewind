export type BeatmapDifficulty = {
  drainRate: number;
  circleSize: number;
  overallDifficulty: number;
  approachRate: number;
  sliderMultiplier: number;
  sliderTickRate: number;
};

export const DEFAULT_BEATMAP_DIFFICULTY: BeatmapDifficulty = Object.freeze({
  drainRate: 5,
  circleSize: 5,
  overallDifficulty: 5,
  approachRate: 5,
  sliderMultiplier: 1,
  sliderTickRate: 1,
});
