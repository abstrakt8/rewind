// Bitmask flags of the hit sounds that a hit object plays (osu! file format `hitSound`).
export enum HitSoundType {
  None = 0,
  Normal = 1,
  Whistle = 2,
  Finish = 4,
  Clap = 8,
}

export class HitSampleInfo {
  static HIT_WHISTLE = "hitwhistle";
  static HIT_FINISH = "hitfinish";
  static HIT_NORMAL = "hitnormal";
  static HIT_CLAP = "hitclap";
  static SLIDER_TICK = "slidertick";

  volume = 0;
  lookupNames?: IterableIterator<string>;

  static ALL_ADDITIONS = [HitSampleInfo.HIT_WHISTLE, HitSampleInfo.HIT_CLAP, HitSampleInfo.HIT_FINISH];

  // name could be one of those HIT_WHISTLE, ...
  name = "";
  // sample set such as drum, normal, soft
  bank: string | null;
  suffix: string | null;

  constructor(name: string, bank: string | null = null, suffix: string | null = null, volume = 0) {
    this.name = name;
    this.bank = bank;
    this.suffix = suffix;
    this.volume = volume;
  }

  // with() for overriding
}

/**
 * Builds the legacy sample file name (without extension) for the given sample bank (normal/soft/drum), sample name
 * (e.g. `hitclap`) and custom sample index. A custom index of 0 or 1 uses the default file (no numeric suffix),
 * while an index >= 2 is appended, e.g. `legacySampleFileName("soft", "hitclap", 3)` => `soft-hitclap3`.
 */
export function legacySampleFileName(bank: string, name: string, sampleIndex: number): string {
  return sampleIndex >= 2 ? `${bank}-${name}${sampleIndex}` : `${bank}-${name}`;
}

/**
 * Per-object sample overrides, coming from a hit object's `normalSet:additionSet:index:volume:filename` field.
 * A `null` bank / a `0` index or volume means "inherit from the active sample control point (timing point)".
 */
export interface HitSampleBankInfo {
  normalBank: string | null;
  additionBank: string | null;
  index: number;
  // In [0, 100].
  volume: number;
  // Custom file (with extension) played instead of the bank normal sound.
  filename: string | null;
}

export const DEFAULT_HIT_SAMPLE_BANK_INFO: HitSampleBankInfo = Object.freeze({
  normalBank: null,
  additionBank: null,
  index: 0,
  volume: 0,
  filename: null,
});

/**
 * A single slider edge (node): its hit sound bitmask and per-node sample overrides. Nodes are ordered head, repeats,
 * tail (`repeatCount + 2` in total).
 */
export interface SliderEdgeSample {
  hitSound: number;
  sample: HitSampleBankInfo;
}
