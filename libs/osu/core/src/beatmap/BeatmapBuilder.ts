import { Blueprint } from "../blueprint/Blueprint";
import { BeatmapDifficulty } from "./BeatmapDifficulty";
import {
  HitCircleSettings,
  HitObjectSettings,
  HitObjectSettingsType,
  SliderSettings,
  SpinnerSettings,
} from "../blueprint/HitObjectSettings";
import { ControlPointInfo } from "./ControlPoints/ControlPointInfo";
import { HitCircle } from "../hitobjects/HitCircle";
import { BeatmapDifficultyAdjuster, ModSettings, OsuClassicMod } from "../mods/Mods";
import produce from "immer";
import { modifyStackingPosition } from "../mods/StackingMod";
import { generateSliderCheckpoints } from "../hitobjects/slider/SliderCheckPointGenerator";
import { SliderCheckPointDescriptor } from "../hitobjects/slider/SliderCheckPointDescriptor";
import { SliderPath } from "../hitobjects/slider/SliderPath";
import { TimingControlPoint } from "./ControlPoints/TimingControlPoint";
import { Slider } from "../hitobjects/Slider";
import { SliderCheckPoint } from "../hitobjects/SliderCheckPoint";
import { Beatmap } from "./Beatmap";
import { Spinner } from "../hitobjects/Spinner";
import { difficultyRange } from "@rewind/osu/math";
import { OsuHitObject } from "../hitobjects/Types";

// Minimum preempt time at AR=10
const DEFAULT_FADE_IN = 400;
const PREEMPT_MIN = 450;

function approachDurationFromAR(AR: number) {
  return difficultyRange(AR, 1800, 1200, PREEMPT_MIN);
}

function circleScaleFromCS(CS: number) {
  return (1.0 - (0.7 * (CS - 5)) / 5) / 2;
}

function createHitCircle(
  id: string,
  hitCircleSettings: HitCircleSettings,
  controlPointInfo: ControlPointInfo,
  beatmapDifficulty: BeatmapDifficulty,
): HitCircle {
  const hitCircle = new HitCircle();
  hitCircle.id = id;
  hitCircle.position = hitCircleSettings.position;
  hitCircle.hitTime = hitCircleSettings.time;
  hitCircle.scale = circleScaleFromCS(beatmapDifficulty.circleSize);
  hitCircle.approachDuration = approachDurationFromAR(beatmapDifficulty.approachRate);
  return hitCircle;
}

function createSliderCheckPoint(slider: Slider, id: string, descriptor: SliderCheckPointDescriptor) {
  const checkPoint = new SliderCheckPoint(slider);
  const { time, spanStartTime, spanIndex, pathProgress } = descriptor;
  checkPoint.id = id;
  checkPoint.offset = slider.path.positionAt(pathProgress);
  checkPoint.type = descriptor.type;
  checkPoint.hitTime = time;
  checkPoint.spanIndex = spanIndex;
  checkPoint.spanStartTime = spanStartTime;
  checkPoint.spanProgress = pathProgress; // TODO rename pathProgress or add some doc idk what it is
  return checkPoint;
}

function createSliderCheckPoints(slider: Slider): SliderCheckPoint[] {
  const checkPoints: SliderCheckPoint[] = [];
  let checkpointIndex = 0;
  for (const e of generateSliderCheckpoints(
    slider.startTime,
    slider.spanDuration,
    slider.velocity,
    slider.tickDistance,
    slider.path.distance,
    slider.spanCount,
    slider.legacyLastTickOffset,
  )) {
    const id = `${slider.id}/${checkpointIndex++}`;
    checkPoints.push(createSliderCheckPoint(slider, id, e));
  }
  return checkPoints;
}

function createSlider(
  index: number,
  sliderSettings: SliderSettings,
  controlPointInfo: ControlPointInfo,
  difficulty: BeatmapDifficulty,
): Slider {
  const approachDuration = approachDurationFromAR(difficulty.approachRate);
  const scale = circleScaleFromCS(difficulty.circleSize);
  const hitTime = sliderSettings.time;
  const timingPoint: TimingControlPoint = controlPointInfo.timingPointAt(hitTime);
  const difficultyPoint = controlPointInfo.difficultyPointAt(hitTime);
  const scoringDistance = Slider.BASE_SCORING_DISTANCE * difficulty.sliderMultiplier * difficultyPoint.speedMultiplier;
  const sliderId = index.toString();

  const head = new HitCircle();
  head.id = `${index.toString()}/HEAD`;
  head.position = sliderSettings.position;
  head.hitTime = sliderSettings.time;
  head.approachDuration = approachDuration;
  head.scale = scale;
  head.sliderId = sliderId;

  const slider = new Slider(head);
  slider.id = sliderId;
  slider.repeatCount = sliderSettings.repeatCount;
  slider.legacyLastTickOffset = sliderSettings.legacyLastTickOffset;
  slider.velocity = scoringDistance / timingPoint.beatLength;
  slider.tickDistance = (scoringDistance / difficulty.sliderTickRate) * sliderSettings.tickDistanceMultiplier;
  slider.path = new SliderPath(sliderSettings.pathPoints, sliderSettings.length);
  slider.checkPoints = createSliderCheckPoints(slider);
  return slider;
}

function createSpinner(
  id: string,
  settings: SpinnerSettings,
  controlPointInfo: ControlPointInfo,
  difficulty: BeatmapDifficulty,
) {
  const spinner = new Spinner();
  spinner.id = id;
  spinner.startTime = settings.time;
  spinner.duration = settings.duration;
  return spinner;
}

function createStaticHitObject(
  index: number,
  hitObjectSetting: HitObjectSettings,
  controlPointInfo: ControlPointInfo,
  beatmapDifficulty: BeatmapDifficulty,
): OsuHitObject {
  switch (hitObjectSetting.type) {
    case "HIT_CIRCLE":
      return createHitCircle(
        index.toString(),
        hitObjectSetting as HitCircleSettings,
        controlPointInfo,
        beatmapDifficulty,
      );
    case "SLIDER":
      return createSlider(index, hitObjectSetting as SliderSettings, controlPointInfo, beatmapDifficulty);
    case "SPINNER":
      return createSpinner(index.toString(), hitObjectSetting as SpinnerSettings, controlPointInfo, beatmapDifficulty);
  }
  throw new Error("Type not recognized...");
}

function assignComboIndex(bluePrintSettings: HitObjectSettings[], hitObjects: OsuHitObject[]): OsuHitObject[] {
  if (bluePrintSettings.length !== hitObjects.length) {
    throw Error("Lengths must match");
  }

  return produce(hitObjects, (list) => {
    let comboSetIndex = -1,
      withinSetIndex = 0;
    for (let i = 0; i < list.length; i++) {
      const { newCombo, comboSkip, type } = bluePrintSettings[i];
      const hitObject = hitObjects[i]; // change 'const' -> 'let' for better readability

      if (i === 0 || newCombo || type === "SPINNER") {
        comboSetIndex += comboSkip + 1;
        withinSetIndex = 0;
      }

      // Spinners do not have comboSetIndex or withinComboSetIndex
      if (hitObject instanceof HitCircle) {
        hitObject.comboSetIndex = comboSetIndex;
        hitObject.withinComboSetIndex = withinSetIndex++;
      } else if (hitObject instanceof Slider) {
        hitObject.head.comboSetIndex = comboSetIndex;
        hitObject.head.withinComboSetIndex = withinSetIndex++;
      }
    }
  });
}

interface BeatmapBuilderOptions {
  addStacking: boolean;
  mods: OsuClassicMod[];
}

const defaultBeatmapBuilderOptions: BeatmapBuilderOptions = {
  addStacking: true,
  mods: [],
};

// There should only be one, otherwise ...
function findDifficultyApplier(mods: OsuClassicMod[]): BeatmapDifficultyAdjuster {
  for (const m of mods) {
    if (ModSettings[m].difficultyAdjuster) {
      return ModSettings[m].difficultyAdjuster;
    }
  }
  return (d: BeatmapDifficulty) => d; // The identity function
}

/**
 * Builds the beatmap from the given blue print and options.
 *
 * It DOES not perform a check on the given subset of mods. So if you enter half time and double time at the same time,
 * then this might return bad results.
 *
 * @param {Blueprint} bluePrint
 * @param {Object} options
 * @param {boolean} options.addStacking
 */
export function buildBeatmap(bluePrint: Blueprint, options?: Partial<BeatmapBuilderOptions>): Beatmap {
  const { beatmapVersion, stackLeniency } = bluePrint.blueprintInfo;
  const { mods, addStacking } = { ...defaultBeatmapBuilderOptions, ...options };

  const finalDifficulty = findDifficultyApplier(mods)(bluePrint.defaultDifficulty);

  let hitObjects: OsuHitObject[] = bluePrint.hitObjectSettings.map((setting, index) =>
    createStaticHitObject(index, setting, bluePrint.controlPointInfo, finalDifficulty),
  );

  hitObjects = assignComboIndex(bluePrint.hitObjectSettings, hitObjects);

  // Adjusts hit objects such as flipping in the vertical direction in HardRock.
  for (const mod of mods) {
    const adjuster = ModSettings[mod].hitObjectsAdjuster;
    if (adjuster !== undefined) hitObjects = adjuster(hitObjects);
  }

  if (addStacking) {
    hitObjects = modifyStackingPosition(beatmapVersion, hitObjects, stackLeniency);
  }

  return new Beatmap(hitObjects, finalDifficulty, mods);
}
