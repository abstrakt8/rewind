// https://osu.ppy.sh/wiki/en/osu%21_File_Formats/Osu_%28file_format%29#type
import { Position } from "@rewind/osu/math";
import { PathControlPoint } from "../hitobjects/slider/PathControlPoint";

// TODO: In the future I want the blue print structured like

export type HitObjectSettingsType = "HIT_CIRCLE" | "SLIDER" | "SPINNER" | "MANIA_HOLD";

const HitObjectSettingBit = {
  HIT_CIRCLE: 0,
  SLIDER: 1,
  SPINNER: 3,
  MANIA_HOLD: 7,
} as const;

// In the future (osu!lazer) there might be other settings such as custom circle size, custom AR, ...
export interface HitObjectSettings {
  type: HitObjectSettingsType;
  position: Position;
  time: number;

  // New combo or not
  newCombo: boolean;
  // An integer specifying how many combo colours to skip, if this object starts a new combo.
  comboSkip: number;
}

// Not really sure if redundant
export interface HitCircleSettings extends HitObjectSettings {
  type: "HIT_CIRCLE";
}

export interface SliderSettings extends HitObjectSettings {
  type: "SLIDER";

  repeatCount: number;
  // pathPoints consists of multiple segments while segment has a path type.
  // e.g. `[Circle[p1, p2, p3], Bezier[p4, p5, p6, p7], Catmull[p8, p9, p10]]`.
  // The type of the segment is determined by its first point, so in the above's it would be in p1, p4 and p8.
  pathPoints: PathControlPoint[];
  length: number;

  // 36
  legacyLastTickOffset: number;

  // In osu!lazer = 1. While parsing it might differ depending on osuBeatmapVersion
  tickDistanceMultiplier: 1;
}

export interface SpinnerSettings extends HitObjectSettings {
  type: "SPINNER";
  duration: number;
  // x and y do not affect spinners. They default to the centre of the playfield, 256,192.
}
