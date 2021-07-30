export function circleSizeToScale(cs: number) {
  return (1.0 - (0.7 * (cs - 5)) / 5) / 2;
}

export function difficultyRange(difficulty: number, min: number, mid: number, max: number): number {
  if (difficulty > 5.0) return mid + ((max - mid) * (difficulty - 5.0)) / 5.0;
  return difficulty < 5.0 ? mid - ((mid - min) * (5.0 - difficulty)) / 5.0 : mid;
}

function difficultyRangeForOd(difficulty: number, range: { od0: number; od5: number; od10: number }): number {
  return difficultyRange(difficulty, range.od0, range.od5, range.od10);
}

type HitWindows = number[];

const stdRanges: [number, number, number][] = [
  [80, 50, 20], // Great = 300
  [140, 100, 60], // Ok = 100
  [200, 150, 100], // Meh = 50
  [400, 400, 400], // Miss
];

export const lazerHitWindowsForOD = (od: number): HitWindows => {
  return stdRanges.map(([od0, od5, od10]) => difficultyRange(od, od0, od5, od10));
};

// [5, 10, 15, 100] means
// [-5, 5] is HitWindow of 300
// [-10, -5) and (+5, 10] is HitWindow of 100

export const hitWindowsForOD = (od: number, lazer?: boolean): HitWindows => {
  if (lazer) {
    return lazerHitWindowsForOD(od);
  }
  // https://github.com/ppy/osu/issues/11311
  return lazerHitWindowsForOD(od).map((w) => w - 1);
};

// -1 if there is none
export const resultForHitWindows = (hitWindows: HitWindows, delta: number) =>
  hitWindows.findIndex((w) => Math.abs(delta) <= w);
