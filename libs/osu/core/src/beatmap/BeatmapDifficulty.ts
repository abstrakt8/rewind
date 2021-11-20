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
  // Technically speaking default value of AR is 5 because OD is 5
  // https://github.com/ppy/osu/blob/b1fcb840a9ff4d866aac262ace7f54fa88b5e0ce/osu.Game/Beatmaps/BeatmapDifficulty.cs#L35
  approachRate: 5,
  sliderMultiplier: 1,
  sliderTickRate: 1,
});
