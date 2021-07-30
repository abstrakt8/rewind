// https://osu.ppy.sh/wiki/en/osu%21_File_Formats/Osu_%28file_format%29#type
import { PathType } from "../hitobjects/slider/PathType";
import { Position } from "osu-math";
import { PathControlPoint } from "../hitobjects/slider/PathControlPoint";

export enum HitObjectSettingsType {
  HIT_CIRCLE = 0,
  SLIDER = 1,
  SPINNER = 3,
  MANIA_HOLD = 7,
}

// In the future (osu!lazer) there might be other settings such as custom circle size, custom AR, ...
export class HitObjectSettings {
  type = HitObjectSettingsType.HIT_CIRCLE;
  position = { x: 0, y: 0 } as Position;
  time = 0;

  // New combo or not
  newCombo = false;
  // An integer specifying how many combo colours to skip, if this object starts a new combo.
  comboSkip = 0;
}

// Not really sure if redundant
export class HitCircleSettings extends HitObjectSettings {
  type = HitObjectSettingsType.HIT_CIRCLE;
}

export class SliderSettings extends HitObjectSettings {
  type = HitObjectSettingsType.SLIDER;

  repeatCount = 0;
  // pathPoints consists of multiple segments while segment has a path type.
  // e.g. `[Circle[p1, p2, p3], Bezier[p4, p5, p6, p7], Catmull[p8, p9, p10]]`.
  // The type of the segment is determined by its first point, so in the above's it would be in p1, p4 and p8.
  pathPoints: PathControlPoint[] = [];
  length = 0;

  legacyLastTickOffset = 36;

  // In osu!lazer = 1. While parsing it might differ depending on osuBeatmapVersion
  tickDistanceMultiplier = 1;
}

export class SpinnerSettings extends HitObjectSettings {
  type = HitObjectSettingsType.SPINNER;
  // End time of the spinner, in milliseconds from the beginning of the beatmap's audio.
  endTime = 0;
  // x and y do not affect spinners. They default to the centre of the playfield, 256,192.
}
