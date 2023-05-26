import { injectable } from "inversify";
import { GameSimulator } from "../../../common/game/GameSimulator";
import { Container, Text } from "pixi.js";
import {
  calculateDigits,
  OsuClassicAccuracy,
  OsuClassicHitErrorBar,
  OsuClassicNumber,
} from "@rewind/osu-pixi/classic-components";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import { formatGameTime, hitWindowsForOD } from "@osujs/math";
import { GameplayClock } from "../../../common/game/GameplayClock";
import { BeatmapManager } from "../../../manager/BeatmapManager";
import { mean, standardDeviation } from "simple-statistics";
import { HitErrorBarSettingsStore } from "../../../common/hit-error-bar";
import { SkinHolder } from "../../../common/skin";

function calculateUnstableRate(x: number[]) {
  return x.length === 0 ? 0 : standardDeviation(x) * 10;
}

function calculateMean(x: number[]) {
  return x.length === 0 ? 0 : mean(x);
}

function calculateMedian(x: number[]) {
  if (x.length === 0) {
    return 0;
  }
  if (x.length === 1) {
    return x[0];
  }
  const mid = Math.floor(x.length / 2),
        nums = [...x].sort((a, b) => a - b);
  return x.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

@injectable()
export class ForegroundHUDPreparer {
  container: Container;
  stats: Text;
  hitErrorBar: OsuClassicHitErrorBar;

  hitMinIndex = 0;
  hitMaxIndex = 0;

  // these are game clock rate adjusted
  allHits: number[] = [];
  recentHits: number[] = [];

  constructor(
    private readonly beatmapManager: BeatmapManager,
    private readonly skinManager: SkinHolder,
    private readonly gameSimulator: GameSimulator,
    private readonly gameplayClock: GameplayClock,
    private readonly hitErrorBarSettingsStore: HitErrorBarSettingsStore,
  ) {
    this.container = new Container();
    this.stats = new Text("", { fontSize: 16, fill: 0xeeeeee, fontFamily: "Arial", align: "left" });
    this.hitErrorBar = new OsuClassicHitErrorBar();
  }

  updateHitErrorBar() {
    const time = this.gameplayClock.timeElapsedInMs;

    const beatmap = this.beatmapManager.getBeatmap();
    const gameClockRate = beatmap.gameClockRate;
    const maxHitErrorTime = 10000;
    const hits: any[] = [];
    this.allHits = [];
    this.recentHits = [];
    for (const [judgementTime, offset, hit] of this.gameSimulator.hits) {
      const timeAgo = time - judgementTime;
      if (timeAgo < 0) break;
      if (timeAgo <= maxHitErrorTime) hits.push({ timeAgo: time - judgementTime, offset, miss: !hit });
      if (hit) {
        this.allHits.push(offset / gameClockRate);
        if (timeAgo < 1000) this.recentHits.push(offset / gameClockRate);
      }
    }

    // if (h.length === 0) {
    //   return;
    // }
    // if (this.lastHits !== h) {
    //   this.hitMinIndex = this.hitMaxIndex = 0;
    //   this.lastHits = h;
    // }

    // TODO: This needs to be reset in case hits gets changed

    // while (this.hitMaxIndex + 1 < h.length && h[this.hitMaxIndex + 1][0] <= time) this.hitMaxIndex++;
    // while (this.hitMaxIndex >= 0 && h[this.hitMaxIndex][0] > time) this.hitMaxIndex--;
    //
    // while (this.hitMinIndex + 1 < h.length && h[this.hitMinIndex + 1][0] < time - maxTime) this.hitMinIndex++;
    // while (this.hitMinIndex >= 0 && h[this.hitMinIndex][0] >= time - maxTime) this.hitMinIndex--;
    //
    // const hits: any[] = [];
    // for (let i = this.hitMinIndex + 1; i < this.hitMaxIndex; i++) {
    //   hits.push({ timeAgo: time - h[i][0], offset: h[i][1], miss: !h[i][2] });
    // }
    // console.log(hits.length);

    const [hitWindow300, hitWindow100, hitWindow50] = hitWindowsForOD(beatmap.difficulty.overallDifficulty);
    this.hitErrorBar.prepare({
      hitWindow50,
      hitWindow100,
      hitWindow300,
      hits,
      // hits: [
      //   { timeAgo: 100, offset: -2 },
      //   { timeAgo: 2, offset: +10 },
      // ],
    });
    this.hitErrorBar.container.position.set(STAGE_WIDTH / 2, STAGE_HEIGHT - 20);
    this.hitErrorBar.container.scale.set(this.hitErrorBarSettingsStore.settings.scale);
    this.container.addChild(this.hitErrorBar.container);
  }

  updateComboNumber() {
    const skin = this.skinManager.getSkin();
    const gameplayInfo = this.gameSimulator.getCurrentInfo();

    if (gameplayInfo) {
      const comboNumber = new OsuClassicNumber();
      const textures = skin.getComboNumberTextures();
      const overlap = skin.config.fonts.comboOverlap;
      comboNumber.prepare({ digits: calculateDigits(gameplayInfo.currentCombo), textures, overlap });
      comboNumber.position.set(0, STAGE_HEIGHT - 50);
      this.container.addChild(comboNumber);
    }
  }

  updateHUD() {
    this.container.removeChildren();
    this.updateComboNumber();
    this.updateAccuracy();
    this.updateHitErrorBar();
    this.updateStats();
  }

  private updateAccuracy() {
    const skin = this.skinManager.getSkin();
    const gameplayInfo = this.gameSimulator.getCurrentInfo();
    if (gameplayInfo) {
      // const text
      const accNumber = new OsuClassicAccuracy();
      const digitTextures = skin.getScoreTextures();
      const dotTexture = skin.getTexture("SCORE_DOT");
      const percentageTexture = skin.getTexture("SCORE_PERCENT");
      const overlap = skin.config.fonts.scoreOverlap;
      accNumber.prepare({ accuracy: gameplayInfo.accuracy, digitTextures, dotTexture, percentageTexture, overlap });
      accNumber.container.position.set(STAGE_WIDTH - 15, 25);
      this.container.addChild(accNumber.container);
    }
  }

  private updateStats() {
    const gameplayInfo = this.gameSimulator.getCurrentInfo();
    const gameplayState = this.gameSimulator.getCurrentState();
    const time = this.gameplayClock.timeElapsedInMs;

    if (gameplayInfo && gameplayState) {
      const count = gameplayInfo.verdictCounts;
      const maxCombo = gameplayInfo.maxComboSoFar;

      const digits = 2;
      const globalMean = calculateMean(this.allHits);
      const globalDeviation = calculateUnstableRate(this.allHits);
      const globalMedian = calculateMedian(this.allHits);

      const localMean = calculateMean(this.recentHits);
      const localDeviation = calculateUnstableRate(this.recentHits);
      const localMedian = calculateMedian(this.recentHits);

      this.stats.text = `Time: ${formatGameTime(time, true)}
300: ${count[0]}
100: ${count[1]}
50: ${count[2]}
Misses: ${count[3]}

MaxCombo: ${maxCombo}

Global
UR: ${globalDeviation.toFixed(digits)}
Mean: ${globalMean.toFixed(digits)}ms
Median: ${globalMedian.toFixed(digits)}ms

Local
UR: ${localDeviation.toFixed(digits)}
Mean: ${localMean.toFixed(digits)}ms
Median: ${localMedian.toFixed(digits)}ms
`;

      this.stats.position.set(25, 50);
      this.container.addChild(this.stats);
    }
  }
}
