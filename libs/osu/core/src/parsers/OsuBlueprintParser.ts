import { Blueprint } from "../blueprint/Blueprint";
import { clamp, floatEqual, Position, Vec2 } from "@rewind/osu/math";
import { PathControlPoint } from "../hitobjects/slider/PathControlPoint";
import { PathType } from "../hitobjects/slider/PathType";
import { TimeSignatures } from "../beatmap/TimeSignatures";
import { LegacyEffectFlags } from "../beatmap/LegacyEffectFlag";
import { ControlPoint } from "../beatmap/ControlPoints/ControlPoint";
import { TimingControlPoint } from "../beatmap/ControlPoints/TimingControlPoint";
import { DifficultyControlPoint } from "../beatmap/ControlPoints/DifficultyControlPoint";
import { EffectControlPoint } from "../beatmap/ControlPoints/EffectControlPoint";
import { SampleControlPoint } from "../beatmap/ControlPoints/SampleControlPoint";
import { HitSampleInfo } from "../audio/HitSampleInfo";
import { LegacySampleBank } from "../audio/LegacySampleBank";
import { HitCircleSettings, SliderSettings, SpinnerSettings } from "../blueprint/HitObjectSettings";

// Credit to osu-bpdpc
// Something like [General]
const SECTION_REGEX = /^\s*\[(.+?)]\s*$/;
const DEFAULT_LEGACY_TICK_OFFSET = 36;

function stripComments(line: string): string {
  const index = line.indexOf("//");
  if (index > 0) {
    return line.substr(0, index);
  } else {
    return line;
  }
}

enum LegacyHitObjectType {
  Circle = 1,
  Slider = 1 << 1,
  NewCombo = 1 << 2,
  Spinner = 1 << 3,
  ComboSkip = (1 << 4) | (1 << 5) | (1 << 6),
  Hold = 1 << 7,
}

enum LegacyHitSoundType {
  None = 0,
  Normal = 1,
  Whistle = 2,
  Finish = 4,
  Clap = 8,
}

export class LegacyHitSampleInfo extends HitSampleInfo {
  isLayered: boolean;
  customSampleBank: number;

  constructor(name: string, bank: string | null = null, volume = 0, customSampleBank = 0, isLayered = false) {
    super(name, bank, customSampleBank >= 2 ? customSampleBank.toString() : null, volume);
    this.isLayered = isLayered;
    this.customSampleBank = customSampleBank;
  }
}

function hasFlag(bitmask: number, flag: number): boolean {
  return (bitmask & flag) !== 0;
}

function splitKeyVal(line: string, separator = ":"): [string, string] {
  const split = line.split(separator, 2);
  return [split[0].trim(), split[1]?.trim() ?? ""];
}

function convertPathType(value: string): PathType {
  // we only check first character lol
  switch (value[0]) {
    // what does this mean
    default:
    case "C":
      return PathType.Catmull;
    case "B":
      return PathType.Bezier;
    case "L":
      return PathType.Linear;
    case "P":
      return PathType.PerfectCurve;
  }
}

// ???
class LegacyDifficultyControlPoint extends DifficultyControlPoint {
  bpmMultiplier: number;

  constructor(beatLength: number) {
    super();
    // Note: In stable, the division occurs on floats, but with compiler optimisations turned on actually seems to occur on doubles via some .NET black magic (possibly inlining?).
    this.bpmMultiplier = beatLength < 0 ? clamp(-beatLength, 10, 10000) / 100.0 : 1;
  }
}

// https://github.com/ppy/osu/blob/82848a7d70e8bb1dbd7bed2b4a178dfe2ce94bcc/osu.Game/Rulesets/Objects/Legacy/ConvertHitObjectParser.cs#L391
type SampleBankInfo = {
  fileName: string;
  normal: string;
  add: string;
  volume: number;
  customSampleBank: number;
};

function convertPathString(pointString: string, offset: Position): PathControlPoint[] {
  const pointSplit = pointString.split("|");
  const controlPoints: PathControlPoint[] = [];
  let startIndex = 0;
  let endIndex = 0;
  let first = true;

  while (++endIndex < pointSplit.length) {
    // Keep incrementing endIndex while it's not the start of a new segment (indicated by having a type descriptor of length 1).
    if (pointSplit[endIndex].length > 1) continue;
    // Multi-segmented sliders DON'T contain the end point as part of the current segment as it's assumed to be the start of the next segment.
    // The start of the next segment is the index after the type descriptor.
    const endPoint = endIndex < pointSplit.length - 1 ? pointSplit[endIndex + 1] : null;

    const points = convertPoints(pointSplit.slice(startIndex, endIndex), endPoint, first, offset);
    controlPoints.push(...points);
    startIndex = endIndex;
    first = false;
  }
  if (endIndex > startIndex) {
    controlPoints.push(...convertPoints(pointSplit.slice(startIndex, endIndex), null, first, offset));
  }
  return controlPoints;
}

// reads the relative position from the given `startPos`
function readPoint(value: string, startPos: Position, points: PathControlPoint[], index: number): void {
  const [x, y] = value.split(":").map(parseFloat);
  const position = Vec2.sub({ x, y }, startPos);
  points[index] = { offset: position };
}

function isLinear(p: Position[]): boolean {
  return floatEqual(0, (p[1].y - p[0].y) * (p[2].x - p[0].x) - (p[1].x - p[0].x) * (p[2].y - p[0].y));
}

function convertPoints(
  points: string[],
  endPoint: string | null,
  first: boolean,
  offset: Position,
): PathControlPoint[] {
  let type: PathType = convertPathType(points[0]);
  const readOffset = first ? 1 : 0;
  const readablePoints = points.length - 1;
  const endPointLength = endPoint !== null ? 1 : 0;

  const vertices: PathControlPoint[] = new Array(readOffset + readablePoints + endPointLength);

  // Fill any non-read points
  for (let i = 0; i < readOffset; i++) vertices[i] = { offset: Vec2.Zero };
  // Parse into control points.
  for (let i = 1; i < points.length; i++) readPoint(points[i], offset, vertices, readOffset + i - 1);
  if (endPoint !== null) readPoint(endPoint, offset, vertices, vertices.length - 1);

  if (type === PathType.PerfectCurve) {
    if (vertices.length !== 3) type = PathType.Bezier;
    else if (isLinear(vertices.map((v) => v.offset))) type = PathType.Linear;
  }

  vertices[0].type = type;
  let startIndex = 0;
  let endIndex = 0;

  const result: PathControlPoint[] = [];

  // this is just some logic to not have duplicated positions at the end
  while (++endIndex < vertices.length - endPointLength) {
    if (!Vec2.equal(vertices[endIndex].offset, vertices[endIndex - 1].offset)) {
      continue;
    }

    vertices[endIndex - 1].type = type;
    result.push(...vertices.slice(startIndex, endIndex));

    startIndex = endIndex + 1;
  }
  if (endIndex > startIndex) {
    result.push(...vertices.slice(startIndex, endIndex));
  }
  return result;
}

export function parseOsuHitObjectSetting(line: string): HitCircleSettings | SliderSettings | SpinnerSettings {
  const split = line.split(",");

  // TODO: This has MAX_COORDINATE_VALUE for sanity check
  const position = { x: parseFloat(split[0]), y: parseFloat(split[1]) };
  // TODO: This has +offset (24ms) for beatmapVersion <= 4 (include in BeatmapBuilder)
  const offset = 0; //
  const time = parseFloat(split[2]) + offset;

  const _type = parseInt(split[3]); // also has combo information
  const comboSkip = (_type & LegacyHitObjectType.ComboSkip) >> 4;
  const newCombo: boolean = hasFlag(_type, LegacyHitObjectType.NewCombo);

  const typeBitmask = _type & ~LegacyHitObjectType.ComboSkip & ~LegacyHitObjectType.NewCombo;

  // TODO: samples
  const soundType: number = parseInt(split[4]);
  const bankInfo: SampleBankInfo = {
    add: "",
    customSampleBank: 0,
    fileName: "",
    normal: "",
    volume: 0,
  };

  if (hasFlag(typeBitmask, LegacyHitObjectType.Circle)) {
    // TODO: CustomSampleBanks not supported yet
    // if (split.length > 5) readCustomSampleBanks(split[5], bankInfo);
    return {
      type: "HIT_CIRCLE",
      time,
      position,
      newCombo,
      comboSkip,
    };
  }
  if (hasFlag(typeBitmask, LegacyHitObjectType.Slider)) {
    let length: number | undefined;
    const slides = parseInt(split[6]);
    if (slides > 9000) throw new Error("Slides count is way too high");

    const repeatCount = Math.max(0, slides - 1);

    const pathPoints = convertPathString(split[5], position);

    if (split.length > 7) {
      length = Math.max(0, parseFloat(split[7]));
      if (length === 0) length = undefined;
    }

    return {
      type: "SLIDER",
      time,
      position,
      repeatCount,
      comboSkip,
      newCombo,
      pathPoints,
      length,
      legacyLastTickOffset: DEFAULT_LEGACY_TICK_OFFSET,
      tickDistanceMultiplier: 1,
    };
  }
  if (hasFlag(typeBitmask, LegacyHitObjectType.Spinner)) {
    const duration = Math.max(0, parseFloat(split[5]) + offset - time);
    return {
      type: "SPINNER",
      comboSkip,
      newCombo,
      time,
      position,
      duration,
    };
  }
  throw Error("Unknown type");
}

/*
export class OsuHitObjectParser {
  offset: number;
  formatVersion: number;

  forceNewCombo = false;
  extraComboOffset = 0;

  // Can only be used once
  firstObject: boolean;

  constructor(offset: number, formatVersion: number) {
    this.offset = offset;
    this.formatVersion = formatVersion;
    this.firstObject = true;
  }

  convertSoundType(type: LegacyHitSoundType, bankInfo: SampleBankInfo): HitSampleInfo[] {
    if (bankInfo.fileName) {
      // TODO: Some FileHitSampleInfo
      return []; // TODO: Probably has something to do with custom sample bank
    }
    const soundTypes: HitSampleInfo[] = [
      new LegacyHitSampleInfo(
        HitSampleInfo.HIT_NORMAL,
        bankInfo.normal,
        bankInfo.volume,
        bankInfo.customSampleBank,
        // if the sound type doesn't have the Normal flag set, attach it anyway as a layered sample.
        // None also counts as a normal non-layered sample: https://osu.ppy.sh/help/wiki/osu!_File_Formats/Osu_(file_format)#hitsounds
        type !== LegacyHitSoundType.None && !hasFlag(type, LegacyHitSoundType.Normal)
      )
    ];

    if (hasFlag(type, LegacyHitSoundType.Finish)) {
      soundTypes.push(
        new LegacyHitSampleInfo(HitSampleInfo.HIT_FINISH, bankInfo.add, bankInfo.volume, bankInfo.customSampleBank)
      );
    }
    if (hasFlag(type, LegacyHitSoundType.Whistle)) {
      soundTypes.push(
        new LegacyHitSampleInfo(HitSampleInfo.HIT_WHISTLE, bankInfo.add, bankInfo.volume, bankInfo.customSampleBank)
      );
    }
    if (hasFlag(type, LegacyHitSoundType.Clap)) {
      soundTypes.push(
        new LegacyHitSampleInfo(HitSampleInfo.HIT_CLAP, bankInfo.add, bankInfo.volume, bankInfo.customSampleBank)
      );
    }

    return soundTypes;
  }

  readCustomSampleBanks(str: string, bankInfo: SampleBankInfo) {
    if (!str) {
      return;
    }
    // TODO
    const split = str.split(":");
    const bank = parseInt(split[0]);
    const addBank = parseInt(split[1]);
  }

  // TODO: Directly convert to like in OsuBeatmapConverter
  createSpinner(position: Vec2, newCombo: boolean, comboOffset: number, duration: number) {
    // Convert spinners don't create the new combo themselves, but force the next non-spinner hitobject to create a new combo
    // Their combo offset is still added to that next hitobject's combo index
    this.forceNewCombo = this.forceNewCombo || this.formatVersion <= 8 || newCombo;
    this.extraComboOffset += comboOffset;

    // startTime is set later on ..
    const spinner = new Spinner();
    spinner.position = position;
    spinner.duration = duration;
    spinner.newCombo = newCombo;
    spinner.comboOffset = comboOffset;
    return spinner;
  }

  convertPathString(pointString: string, offset: Vec2): PathControlPoint[] {
    const pointSplit = pointString.split("|");
    const controlPoints = [];
    let startIndex = 0;
    let endIndex = 0;
    let first = true;

    while (++endIndex < pointSplit.length) {
      // Keep incrementing endIndex while it's not the start of a new segment (indicated by having a type descriptor of length 1).
      if (pointSplit[endIndex].length > 1) continue;
      // Multi-segmented sliders DON'T contain the end point as part of the current segment as it's assumed to be the start of the next segment.
      // The start of the next segment is the index after the type descriptor.
      const endPoint = endIndex < pointSplit.length - 1 ? pointSplit[endIndex + 1] : null;

      const points = this.convertPoints(pointSplit.slice(startIndex, endIndex), endPoint, first, offset);
      controlPoints.push(...points);
      startIndex = endIndex;
      first = false;
    }
    if (endIndex > startIndex) {
      controlPoints.push(...this.convertPoints(pointSplit.slice(startIndex, endIndex), null, first, offset));
    }
    return controlPoints;
  }

  // reads the relative position from the given `startPos`
  readPoint(value: string, startPos: Vec2, points: PathControlPoint[], index: number): void {
    const vertexSplit = value.split(":");
    const pos = new Vec2(parseFloat(vertexSplit[0]), parseFloat(vertexSplit[1])).sub(startPos);
    points[index] = new PathControlPoint();
    points[index].position = pos;
  }

  isLinear(p: Vec2[]): boolean {
    return floatEqual(0, (p[1].y - p[0].y) * (p[2].x - p[0].x) - (p[1].x - p[0].x) * (p[2].y - p[0].y));
  }

  convertPoints(points: string[], endPoint: string | null, first: boolean, offset: Vec2): PathControlPoint[] {
    let type: PathType = convertPathType(points[0]);
    const readOffset = first ? 1 : 0;
    const readablePoints = points.length - 1;
    const endPointLength = endPoint !== null ? 1 : 0;

    const vertices: PathControlPoint[] = new Array(readOffset + readablePoints + endPointLength);

    // Fill any non-read points
    for (let i = 0; i < readOffset; i++) vertices[i] = new PathControlPoint();
    // Parse into control points.
    for (let i = 1; i < points.length; i++) this.readPoint(points[i], offset, vertices, readOffset + i - 1);
    if (endPoint !== null) this.readPoint(endPoint, offset, vertices, vertices.length - 1);

    if (type === PathType.PerfectCurve) {
      if (vertices.length !== 3) type = PathType.Bezier;
      else if (this.isLinear(vertices.map(v => v.position))) type = PathType.Linear;
    }

    vertices[0].type = type;
    let startIndex = 0;
    let endIndex = 0;

    const result = [];

    // this is just some logic to not have duplicated positions at the end
    while (++endIndex < vertices.length - endPointLength) {
      if (!vertices[endIndex].position.equals(vertices[endIndex - 1].position)) {
        continue;
      }

      vertices[endIndex - 1].type = type;
      result.push(...vertices.slice(startIndex, endIndex));

      startIndex = endIndex + 1;
    }
    if (endIndex > startIndex) {
      result.push(...vertices.slice(startIndex, endIndex));
    }
    return result;
  }

}

 */

export class OsuBlueprintParser {
  static LATEST_VERSION = 14;

  data: string;
  section: BlueprintSection | null;

  blueprint: Blueprint;
  // hitObjectParser: OsuHitObjectParser;
  offset: number;

  // Disable for testing purposes
  applyOffsets = true;

  formatVersion: number;

  defaultSampleVolume = 100;

  //
  defaultSampleBank: LegacySampleBank = LegacySampleBank.None;

  // TODO: Don't know if we should support stream reading because this does read the entire file into memory though.
  private sectionsToRead: readonly BlueprintSection[];
  private sectionsFinishedReading: string[];

  constructor(data: string, options: BlueprintParseOptions = defaultOptions) {
    this.data = data;
    this.blueprint = new Blueprint();
    this.section = null;
    this.formatVersion = options.formatVersion;
    this.sectionsToRead = options.sectionsToRead;
    this.sectionsFinishedReading = [];

    // BeatmapVersion 4 and lower had an incorrect offset (stable has this set as 24ms off)
    this.offset = this.formatVersion <= 4 ? 24 : 0;
    // this.hitObjectParser = new OsuHitObjectParser(this.offset, this.formatVersion);
  }

  finishedReading() {
    return this.sectionsToRead <= this.sectionsFinishedReading;
  }

  parseLine(line: string): void {
    const strippedLine = stripComments(line);
    // strippedLine can be empty
    if (!strippedLine) return;
    // Parse the file format
    if (!this.section && strippedLine.includes("osu file format v")) {
      this.blueprint.blueprintInfo.beatmapVersion = parseInt(strippedLine.split("osu file format v")[1], 10);
      return;
    }
    if (SECTION_REGEX.test(strippedLine)) {
      // We only add sections we want to read to the list
      if (this.section !== null && this.sectionsToRead.includes(this.section)) {
        this.sectionsFinishedReading.push(this.section);
      }
      this.section = (SECTION_REGEX.exec(strippedLine) as RegExpExecArray)[1] as BlueprintSection;
      // It will stop when we are done with reading all required sections
      return;
    }

    // We skip reading sections we don't want to read for optimization
    if (this.section === null || this.sectionsToRead.indexOf(this.section) === -1) {
      return;
    }

    switch (this.section) {
      case "General":
        this.handleGeneral(strippedLine);
        break;
      case "Metadata":
        this.handleMetadata(strippedLine);
        break;
      case "Difficulty":
        this.handleDifficulty(strippedLine);
        break;
      case "HitObjects":
        this.handleHitObjects(strippedLine);
        break;
      case "TimingPoints":
        this.handleTimingPoints(strippedLine);
        break;
      // Below are low priority sections
      case "Events":
        this.handleEvents(strippedLine);
        break;
      case "Editor":
        this.handleEditor(strippedLine);
        break;
      case "Colours":
        break;
    }
  }

  handleEvents(line: string) {
    const [eventType, _startTime, ...eventParams] = line.split(",");
    switch (eventType) {
      case "0": {
        const [filename, xOffset, yOffset] = eventParams;
        // The quotes can optionally be given ...
        this.blueprint.blueprintInfo.metadata.backgroundFile = filename.replace(/"/g, "");
        this.blueprint.blueprintInfo.metadata.backgroundOffset = {
          // In case they weren't provided: 0,0 should be used according to docs.
          x: parseInt(xOffset ?? "0"),
          y: parseInt(yOffset ?? "0"),
        };
      }
      // Videos and Storyboard ignored for first...
    }
  }

  handleGeneral(line: string): void {
    const [key, value] = splitKeyVal(line);
    const blueprintInfo = this.blueprint.blueprintInfo;
    const metadata = blueprintInfo.metadata;
    switch (key) {
      case "AudioFilename":
        metadata.audioFile = value; // TODO: toStandardisedPath()
        break;
      case "AudioLeadIn":
        blueprintInfo.audioLeadIn = parseInt(value);
        break;
      case "PreviewTime":
        break;
      case "Countdown":
        break;
      case "SampleSet":
        this.defaultSampleBank = parseInt(value); // hopefully it is one of those 4
        break;
      case "SampleVolume":
        break;
      case "StackLeniency":
        blueprintInfo.stackLeniency = parseFloat(value);
        break;
      case "Mode":
        break;
      case "LetterboxInBreaks":
        break;
      case "SpecialStyle":
        break;
      case "WidescreenStoryboard":
        break;
      case "EpilepsyWarning":
        break;
    }
  }

  handleEditor(line: string): void {
    const [key, value] = splitKeyVal(line);
    switch (key) {
      case "Bookmarks":
        break;
      case "DistanceSpacing":
        break;
      case "BeatDivisor":
        break;
      case "GridSize":
        break;
      case "TimelineZoom":
        break;
    }
  }

  handleMetadata(line: string): void {
    const [key, value] = splitKeyVal(line);
    const blueprintInfo = this.blueprint.blueprintInfo;
    const metaData = blueprintInfo.metadata;
    switch (key) {
      case "Title":
        metaData.title = value;
        break;
      case "TitleUnicode":
        metaData.titleUnicode = value;
        break;
      case "Artist":
        metaData.artist = value;
        break;
      case "ArtistUnicode":
        metaData.artistUnicode = value;
        break;
      case "Creator":
        // metaData.authorString = value;
        break;
      case "Version":
        // beatmapInfo.beatmapVersion = value;
        break;
      case "Source":
        break;
      case "Tags":
        metaData.tags = value;
        break;
      case "BeatmapId":
        break;
      case "BeatmapSetID":
        break;
    }
  }

  handleDifficulty(line: string): void {
    const [key, value] = splitKeyVal(line);
    const difficulty = this.blueprint.defaultDifficulty;
    switch (key) {
      case "HPDrainRate":
        difficulty.drainRate = parseFloat(value);
        break;
      case "CircleSize":
        difficulty.circleSize = parseFloat(value);
        break;
      case "OverallDifficulty":
        difficulty.overallDifficulty = parseFloat(value);
        break;
      case "ApproachRate":
        difficulty.approachRate = parseFloat(value);
        break;
      case "SliderMultiplier":
        difficulty.sliderMultiplier = parseFloat(value);
        break;
      case "SliderTickRate":
        difficulty.sliderTickRate = parseFloat(value);
        break;
    }
  }

  handleHitObjects(line: string): void {
    const obj = parseOsuHitObjectSetting(line);
    if (obj) {
      this.blueprint.hitObjectSettings.push(obj);
    }
  }

  handleTimingPoints(line: string): void {
    const split: string[] = line.split(",");

    const time = this.getOffsetTime(parseFloat(split[0].trim()));
    const beatLength = parseFloat(split[1].trim());
    const speedMultiplier = beatLength < 0 ? 100.0 / -beatLength : 1;

    let timeSignature = TimeSignatures.SimpleQuadruple;
    if (split.length >= 3)
      timeSignature = split[2][0] === "0" ? TimeSignatures.SimpleQuadruple : (parseInt(split[2]) as TimeSignatures);

    // TODO: sampleSet default
    let sampleSet: LegacySampleBank = this.defaultSampleBank;
    if (split.length >= 4) sampleSet = parseInt(split[3]);

    let customSampleBank = 0;
    if (split.length >= 5) customSampleBank = parseInt(split[4]);

    let sampleVolume = this.defaultSampleVolume;
    if (split.length >= 6) sampleVolume = parseInt(split[5]);

    let timingChange = true;
    if (split.length >= 7) timingChange = split[6][0] === "1";

    let kiaiMode = false;
    let omitFirstBarSignature = false;
    if (split.length >= 8) {
      const effectFlags = parseInt(split[7]);
      kiaiMode = hasFlag(effectFlags, LegacyEffectFlags.Kiai);
      omitFirstBarSignature = hasFlag(effectFlags, LegacyEffectFlags.OmitFirstBarLine);
    }

    // This will receive the string value from the enum
    let stringSampleSet = LegacySampleBank[sampleSet].toLowerCase();
    if (stringSampleSet === "none") stringSampleSet = "normal";

    if (timingChange) {
      const controlPoint = this.createTimingControlPoint();
      controlPoint.beatLength = beatLength;
      controlPoint.timeSignature = timeSignature;
      this.addControlPoint(time, controlPoint, true);
    }

    {
      const p = new LegacyDifficultyControlPoint(beatLength);
      p.speedMultiplier = speedMultiplier;
      this.addControlPoint(time, p, timingChange);
    }
    {
      const p = new EffectControlPoint();
      p.kiaiMode = kiaiMode;
      p.omitFirstBarLine = omitFirstBarSignature;
      this.addControlPoint(time, p, timingChange);
    }
    {
      const p = new SampleControlPoint();
      p.sampleBank = stringSampleSet;
      p.sampleVolume = sampleVolume;
      // TODO:  Need LegacySampleControlPoint, but this is something we support later on
      // p.customSampleBank = customSampleBank;
      this.addControlPoint(time, p, timingChange);
    }
  }

  pendingControlPoints: ControlPoint[] = [];
  pendingControlPointTypes: { [key: string]: boolean } = {};
  pendingControlPointsTime = 0;

  createTimingControlPoint(): TimingControlPoint {
    return new TimingControlPoint();
  }

  addControlPoint(time: number, point: ControlPoint, timingChange: boolean): void {
    if (!floatEqual(time, this.pendingControlPointsTime)) {
      this.flushPendingPoints();
    }
    if (timingChange) {
      this.pendingControlPoints.splice(0, 0, point);
    } else {
      this.pendingControlPoints.push(point);
    }
    this.pendingControlPointsTime = time;
  }

  flushPendingPoints(): void {
    // Changes from non-timing-points are added to the end of the list (see addControlPoint()) and should override any changes from timing-points (added to the start of the list).
    for (let i = this.pendingControlPoints.length - 1; i >= 0; i--) {
      const type: string = this.pendingControlPoints[i].type;
      if (this.pendingControlPointTypes[type]) continue;
      this.pendingControlPointTypes[type] = true;
      this.blueprint.controlPointInfo.add(this.pendingControlPointsTime, this.pendingControlPoints[i]);
    }
    this.pendingControlPoints = [];
    this.pendingControlPointTypes = {};
  }

  getOffsetTime(time: number): number {
    return time + (this.applyOffsets ? this.offset : 0);
  }

  parse(): Blueprint {
    if (!this.data) throw new Error("No data given");
    const lines = this.data.split("\n").map((v) => v.trim());
    for (const line of lines) {
      this.parseLine(line);
      if (this.finishedReading()) {
        break;
      }
    }
    this.flushPendingPoints();
    return this.blueprint;
  }
}

export const BlueprintSections = [
  "General",
  "Metadata",
  "Difficulty",
  "HitObjects",
  "TimingPoints",
  "Events",
  "Editor",
  "Colours",
] as const;
export type BlueprintSection = typeof BlueprintSections[number];

interface BlueprintParseOptions {
  formatVersion: number;
  sectionsToRead: readonly BlueprintSection[];
}

const defaultOptions: BlueprintParseOptions = {
  formatVersion: OsuBlueprintParser.LATEST_VERSION,
  sectionsToRead: BlueprintSections,
};

export function parseBlueprint(data: string, options?: Partial<BlueprintParseOptions>) {
  const allOptions = Object.assign({ ...defaultOptions }, options);
  const parser = new OsuBlueprintParser(data, allOptions);
  return parser.parse();
}
