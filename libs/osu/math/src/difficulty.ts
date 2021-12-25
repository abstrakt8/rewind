/**
 * Converts the circle size to a normalized scaling value.
 * @param CS the circle size value
 */
export function circleSizeToScale(CS: number) {
  return (1.0 - (0.7 * (CS - 5)) / 5) / 2;
}

// Just a helper function that is commonly used for OD, AR calculation
export function difficultyRange(difficulty: number, min: number, mid: number, max: number): number {
  if (difficulty > 5.0) return mid + ((max - mid) * (difficulty - 5.0)) / 5.0;
  return difficulty < 5.0 ? mid - ((mid - min) * (5.0 - difficulty)) / 5.0 : mid;
}

// Minimum preempt time at AR=10
const PREEMPT_MIN = 450;

/**
 * Returns the approach duration depending on the abstract AR value.
 * @param AR the approach rate value
 */
export function approachRateToApproachDuration(AR: number) {
  return difficultyRange(AR, 1800, 1200, PREEMPT_MIN);
}

function difficultyRangeForOd(difficulty: number, range: { od0: number; od5: number; od10: number }): number {
  return difficultyRange(difficulty, range.od0, range.od5, range.od10);
}

// HitWindows is just an array of four numbers, for example [5, 10, 15, 100] means:
// * [-5, 5] is HitWindow of 300
// * [-10, -5) and (+5, 10] is HitWindow of 100 and so on....
type HitWindows = number[];

const OSU_STD_HIT_WINDOW_RANGES: [number, number, number][] = [
  [80, 50, 20], // Great = 300
  [140, 100, 60], // Ok = 100
  [200, 150, 100], // Meh = 50
  [400, 400, 400], // Miss
];

/**
 * Returns the hit windows in the following order:
 * [Hit300, Hit100, Hit50, HitMiss]
 * @param overallDifficulty
 * @param lazerStyle
 */
export function hitWindowsForOD(overallDifficulty: number, lazerStyle?: boolean): HitWindows {
  function lazerHitWindowsForOD(od: number): HitWindows {
    return OSU_STD_HIT_WINDOW_RANGES.map(([od0, od5, od10]) => difficultyRange(od, od0, od5, od10));
  }

  // Short explanation: currently in lazer the hit windows are actually +1ms bigger due to them using the LTE <=
  // operator instead of LT <  <= instead of < check.
  if (lazerStyle) {
    return lazerHitWindowsForOD(overallDifficulty);
  }
  // https://github.com/ppy/osu/issues/11311
  return lazerHitWindowsForOD(overallDifficulty).map((w) => w - 1);
}
