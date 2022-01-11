import { Blueprint } from "../blueprint/Blueprint";
import { BeatmapDifficulty } from "./BeatmapDifficulty";
import { HitCircleSettings, HitObjectSettings, SliderSettings, SpinnerSettings } from "../blueprint/HitObjectSettings";
import { ControlPointInfo } from "./ControlPoints/ControlPointInfo";
import { HitCircle } from "../hitobjects/HitCircle";
import { BeatmapDifficultyAdjuster, ModSettings, OsuClassicMod } from "../mods/Mods";
import { modifyStackingPosition } from "../mods/StackingMod";
import { generateSliderCheckpoints } from "../hitobjects/slider/SliderCheckPointGenerator";
import { SliderCheckPointDescriptor } from "../hitobjects/slider/SliderCheckPointDescriptor";
import { SliderPath } from "../hitobjects/slider/SliderPath";
import { TimingControlPoint } from "./ControlPoints/TimingControlPoint";
import { Slider } from "../hitobjects/Slider";
import { SliderCheckPoint } from "../hitobjects/SliderCheckPoint";
import { Beatmap } from "./Beatmap";
import { Spinner } from "../hitobjects/Spinner";
import { approachRateToApproachDuration, circleSizeToScale, Position } from "@osujs/math";
import { OsuHitObject } from "../hitobjects/Types";
import { HardRockMod } from "../mods/HardRockMod";
import { PathControlPoint } from "../hitobjects/slider/PathControlPoint";

function copyPosition({ x, y }: Position): Position {
  return { x, y };
}

function createHitCircle(
  id: string,
  hitCircleSettings: HitCircleSettings,
  controlPointInfo: ControlPointInfo,
  beatmapDifficulty: BeatmapDifficulty,
): HitCircle {
  const hitCircle = new HitCircle();
  hitCircle.id = id;
  hitCircle.position = copyPosition(hitCircleSettings.position);
  hitCircle.unstackedPosition = copyPosition(hitCircleSettings.position);
  hitCircle.hitTime = hitCircleSettings.time;
  hitCircle.scale = circleSizeToScale(beatmapDifficulty.circleSize);
  hitCircle.approachDuration = approachRateToApproachDuration(beatmapDifficulty.approachRate);
  return hitCircle;
}

function createSliderCheckPoint(slider: Slider, id: string, descriptor: SliderCheckPointDescriptor) {
  const checkPoint = new SliderCheckPoint(slider);
  const { time, spanStartTime, spanIndex, spanProgress } = descriptor;
  checkPoint.id = id;
  checkPoint.offset = slider.path.positionAt(spanProgress);
  checkPoint.type = descriptor.type;
  checkPoint.hitTime = time;
  checkPoint.spanIndex = spanIndex;
  checkPoint.spanStartTime = spanStartTime;
  checkPoint.spanProgress = spanProgress;
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

function copyPathPoints(pathPoints: PathControlPoint[]) {
  return pathPoints.map(({ type, offset }) => ({
    type,
    offset: copyPosition(offset),
  }));
}

function createSlider(
  index: number,
  sliderSettings: SliderSettings,
  controlPointInfo: ControlPointInfo,
  difficulty: BeatmapDifficulty,
): Slider {
  const approachDuration = approachRateToApproachDuration(difficulty.approachRate);
  const scale = circleSizeToScale(difficulty.circleSize);
  const hitTime = sliderSettings.time;
  const timingPoint: TimingControlPoint = controlPointInfo.timingPointAt(hitTime);
  const difficultyPoint = controlPointInfo.difficultyPointAt(hitTime);
  const scoringDistance = Slider.BASE_SCORING_DISTANCE * difficulty.sliderMultiplier * difficultyPoint.speedMultiplier;
  const sliderId = index.toString();

  const head = new HitCircle();
  head.id = `${index.toString()}/HEAD`;
  head.unstackedPosition = copyPosition(sliderSettings.position);
  head.position = copyPosition(sliderSettings.position);
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
  slider.path = new SliderPath(copyPathPoints(sliderSettings.pathPoints), sliderSettings.length);
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

// Mutates the hitObject combo index values
function assignComboIndex(bluePrintSettings: HitObjectSettings[], hitObjects: OsuHitObject[]) {
  let comboSetIndex = -1,
    withinSetIndex = 0;
  for (let i = 0; i < hitObjects.length; i++) {
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
}

// There should only be one, otherwise ...
function findDifficultyApplier(mods: OsuClassicMod[]): BeatmapDifficultyAdjuster {
  for (const m of mods) {
    const adjuster = ModSettings[m].difficultyAdjuster;
    if (adjuster !== undefined) {
      return adjuster;
    }
  }
  return (d: BeatmapDifficulty) => d; // The identity function
}

interface BeatmapBuilderOptions {
  addStacking: boolean;
  mods: OsuClassicMod[];
}

const defaultBeatmapBuilderOptions: BeatmapBuilderOptions = {
  addStacking: true,
  mods: [],
};

/**
 * Builds the beatmap from the given blueprint and options.
 *
 * It DOES not perform a check on the given subset of mods. So if you enter half-time and double time at the same time,
 * then this might return bad results.
 *
 * @param {Blueprint} bluePrint
 * @param {Object} options
 * @param {boolean} options.addStacking whether to apply setting or not (by default true)
 */
export function buildBeatmap(bluePrint: Blueprint, options?: Partial<BeatmapBuilderOptions>): Beatmap {
  const { beatmapVersion, stackLeniency } = bluePrint.blueprintInfo;
  const { mods, addStacking } = { ...defaultBeatmapBuilderOptions, ...options };

  const finalDifficulty = findDifficultyApplier(mods)(bluePrint.defaultDifficulty);

  const hitObjects: OsuHitObject[] = bluePrint.hitObjectSettings.map((setting, index) =>
    createStaticHitObject(index, setting, bluePrint.controlPointInfo, finalDifficulty),
  );

  assignComboIndex(bluePrint.hitObjectSettings, hitObjects);

  if (mods.includes("HARD_ROCK")) {
    HardRockMod.flipVertically(hitObjects);
  }

  if (addStacking) {
    modifyStackingPosition(hitObjects, stackLeniency, beatmapVersion);
  }

  return new Beatmap(hitObjects, finalDifficulty, mods);
}
