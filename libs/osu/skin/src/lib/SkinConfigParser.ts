import { Color, generateDefaultSkinConfig, SkinConfig, SkinIniSection } from "./SkinConfig";

function parseToBool(val: string): boolean {
  const v = parseInt(val);
  return v !== 0;
}

// TODO: No need for classes, need refactoring
class SkinConfigParser {
  data: string;
  skinConfig: SkinConfig;
  section: SkinIniSection;

  comboColorsAdded = false;

  constructor(data: string) {
    this.data = data;
    this.skinConfig = generateDefaultSkinConfig(true);
    this.section = SkinIniSection.NONE;
  }

  shouldSkipLine(line: string): boolean {
    if (!line) return true;
    return line.trim().startsWith("//");
  }

  stripComments(line: string): string {
    const index = line.indexOf("//");
    if (index > 0) {
      return line.substring(0, index);
    }
    return line;
  }

  splitKeyVal(line: string, separator = ":"): [string, string] {
    let split = line.split(separator, 2);
    if (split.length < 2) split.push("");
    split = split.map((s) => s.trim());
    return [split[0], split[1]];
  }

  handleGeneral(key: string, val: string) {
    const { general } = this.skinConfig;
    switch (key) {
      case "Name":
        general.name = val;
        break;
      case "Author":
        general.author = val;
        break;
      case "Version":
        // Maybe check for 1.0, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, latest ?
        general.version = val;
        break;
      case "AnimationFramerate":
        general.animationFrameRate = parseInt(val);
        break;
      case "AllowSliderBallTint":
        general.allowSliderBallTint = parseToBool(val);
        break;
      case "ComboBurstRandom":
        general.comboBurstRandom = parseToBool(val);
        break;
      case "CursorCentre": // yes spelled differently
        general.cursorCenter = parseToBool(val);
        break;
      case "CursorExpand":
        general.cursorExpand = parseToBool(val);
        break;
      case "CursorRotate":
        general.cursorRotate = parseToBool(val);
        break;
      case "CursorTrailRotate":
        general.cursorTrailRotate = parseToBool(val);
        break;
      case "CustomComboBurstSounds":
        // ??? no clue
        general.customComboBurstSounds = val.split(",").map((s) => parseInt(s));
        break;
      case "HitCircleOverlayAboveNumber":
      case "HitCircleOverlayAboveNumer": // typo also supported
        general.hitCircleOverlayAboveNumber = parseToBool(val);
        break;

      case "LayeredHitSounds":
        general.layeredHitSounds = parseToBool(val);
        break;
      case "SliderBallFlip":
        general.sliderBallFlip = parseToBool(val);
        break;
      case "SpinnerFadePlayfield":
        general.spinnerFadePlayfield = parseToBool(val);
        break;
      case "SpinnerFrequencyModulate":
        general.spinnerFrequencyModulate = parseToBool(val);
        break;
      case "SpinnerNoBlink":
        general.spinnerNoBlink = parseToBool(val);
        break;
      default:
      // console.log(`key=${key} not recognized`);
    }
  }

  handleFonts(key: string, val: string) {
    const { fonts } = this.skinConfig;
    switch (key) {
      case "HitCirclePrefix":
        fonts.hitCirclePrefix = val;
        break;
      case "HitCircleOverlap":
        fonts.hitCircleOverlap = parseInt(val);
        break;
      case "ScorePrefix":
        fonts.scorePrefix = val;
        break;
      case "ScoreOverlap":
        fonts.scoreOverlap = parseInt(val);
        break;
      case "ComboPrefix":
        fonts.comboPrefix = val;
        break;
      case "ComboOverlap":
        fonts.comboOverlap = parseInt(val);
        break;
    }
  }

  handleColors(key: string, val: string) {
    const numbers = val.split(",").map((s) => parseInt(s));
    if (numbers.length !== 3 && numbers.length !== 4) {
      console.error("Should provide (R,G,B) or (R,G,B,A)");
      return;
    }

    const { colors } = this.skinConfig;

    const color = numbers as Color;

    switch (key) {
      case "Combo0":
      case "Combo1":
      case "Combo2":
      case "Combo3":
      case "Combo4":
      case "Combo5":
      case "Combo6":
      case "Combo7":
      case "Combo8":
      case "Combo9":
        // There is a default combo color list
        if (this.comboColorsAdded) colors.comboColors.push(color);
        else {
          colors.comboColors = [color];
          this.comboColorsAdded = true;
        }
        break;
      case "InputOverlayText":
        colors.inputOverlayText = color;
        break;
      case "MenuGlow":
        colors.menuGlow = color;
        break;
      case "SliderBall":
        colors.sliderBall = color;
        break;
      case "SliderBorder":
        colors.sliderBorder = color;
        break;
      case "SliderTrackOverride":
        colors.sliderTrackOverride = color;
        break;
      case "SongSelectActiveText":
        colors.songSelectActiveText = color;
        break;
      case "SongSelectInactiveText":
        colors.songSelectInactiveText = color;
        break;
      case "SpinnerBackground":
        colors.spinnerBackground = color;
        break;
      case "StarBreakAdditive":
        colors.starBreakAdditive = color;
        break;
    }
  }

  getSection(s: string) {
    switch (s) {
      case "General":
        return SkinIniSection.GENERAL;
      case "Colours":
        return SkinIniSection.COLORS;
      case "Fonts":
        return SkinIniSection.FONTS;
    }
    return SkinIniSection.NONE;
  }

  parseLine(line: string): void {
    if (this.shouldSkipLine(line)) return;
    if (line.startsWith("[") && line.endsWith("]")) {
      const sectionStr = line.substring(1, line.length - 1);
      this.section = this.getSection(sectionStr);
      return;
    }
    line = this.stripComments(line);
    const [key, val] = this.splitKeyVal(line);
    switch (this.section) {
      case SkinIniSection.GENERAL:
        this.handleGeneral(key, val);
        break;
      case SkinIniSection.COLORS:
        this.handleColors(key, val);
        break;
      case SkinIniSection.FONTS:
        this.handleFonts(key, val);
        break;
      default:
      // console.log("Line was ignored cause not in a section right now");
    }
  }

  parse(): SkinConfig {
    if (!this.data) throw Error("No data given");
    const lines = this.data.split(/\r?\n/).map((v) => v.trim());
    for (const line of lines) {
      this.parseLine(line);
    }
    return this.skinConfig;
  }
}

export function parseSkinIni(data: string): SkinConfig {
  return new SkinConfigParser(data).parse();
}
