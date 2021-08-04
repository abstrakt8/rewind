import { Container, Sprite, Texture } from "pixi.js";
import { OsuClassicNumber } from "@rewind/osu-pixi/classic-components";
import { Skin } from "../skins/Skin";
import { ReplayViewerContext } from "./ReplayViewerContext";
import { AnalysisHitErrorBar } from "./HitErrorBar";
import { hitWindowsForOD } from "@rewind/osu/math";
import { GameplayInfo, GameplayInfoEvaluator } from "@rewind/osu/core";
import * as PIXI from "pixi.js";

// Default field size
export const OSU_PLAYFIELD_BASE_X = 512;
export const OSU_PLAYFIELD_BASE_Y = 384;

/**
 Contains elements in the following order (far to near):
 - Background: image or maybe story board in the future
 - Playfield: where the action happens
 - Foreground HUD: additional overlay for example Accuracy, UR, PP. Maybe we need a stats UI behind playfield layer
 because some elements like the UR bar get drawn behind the hit objects .
 */
export class MyExtendedPlayfieldContainer {
  widthInPx = 0;
  heightInPx = 0;

  container: Container;

  backgroundSprite: Sprite;
  backgroundUrl: string;
  // playfield: Container
  foregroundHUD: Container;

  hitErrorBar: AnalysisHitErrorBar;

  statsText: PIXI.Text;

  constructor(private readonly playfield: Container, private readonly context: ReplayViewerContext) {
    this.container = new Container();
    this.foregroundHUD = new Container();
    this.hitErrorBar = new AnalysisHitErrorBar();
    this.backgroundSprite = new Sprite();
    this.backgroundSprite.anchor.set(0.5, 0.5);
    this.backgroundUrl = "";
    this.statsText = new PIXI.Text("", { fill: "white", fontSize: 12 });

    this.container.addChild(this.backgroundSprite, this.playfield, this.foregroundHUD);
  }

  get replayTimeMachine() {
    return this.context.replayTimeMachine;
  }

  private get skin(): Skin {
    return this.context.skin;
  }

  /**
   *
   * @param paddingPercent how much padding to use 80% means that there is 10% on both sides is padded.
   */
  getPlayfieldScaling(paddingPercent = 0.8): number {
    if (this.widthInPx < this.heightInPx * (4 / 3)) {
      return (this.widthInPx * paddingPercent) / OSU_PLAYFIELD_BASE_X;
    } else {
      // It's almost always constrained by height
      // Maybe the other case will happen if the user is watching this on mobile in vertical mode.
      return (this.heightInPx * paddingPercent) / OSU_PLAYFIELD_BASE_Y;
    }
  }

  resizeTo(widthInPx: number, heightInPx: number): void {
    this.widthInPx = widthInPx;
    this.heightInPx = heightInPx;

    this.backgroundSprite.position.set(this.widthInPx / 2, this.heightInPx / 2);
    const scaling = this.getPlayfieldScaling();
    this.playfield.scale.set(scaling);
    // Set it to the center
    this.playfield.position.set(
      (widthInPx - OSU_PLAYFIELD_BASE_X * scaling) / 2,
      (heightInPx - OSU_PLAYFIELD_BASE_Y * scaling) / 2,
    );
  }

  // TODO: Background technically depends on the beatmap settings
  // Maybe use a Texture upon BaseTexture (using frame)
  setBackground(texture: Texture): void {
    this.backgroundSprite.texture = texture;
  }

  setBackgroundAlpha(alpha: number): void {
    this.backgroundSprite.alpha = alpha;
  }

  applyHud(time: number) {
    this.foregroundHUD.removeChildren();
    // combo
    const replayState = this.replayTimeMachine?.replayStateAt(time);
    let gameplayInfo: GameplayInfo;

    if (replayState)
      gameplayInfo = new GameplayInfoEvaluator(this.context.beatmap, {}).evaluateReplayState(replayState);

    if (replayState) {
      const comboNumber = new OsuClassicNumber();
      const textures = this.skin.getComboNumberTextures();
      const overlap = this.skin.config.fonts.comboOverlap;
      comboNumber.prepare({ number: gameplayInfo.currentCombo, textures, overlap });
      comboNumber.position.set(100, this.heightInPx - 50);
      this.foregroundHUD.addChild(comboNumber);
    }

    // acc

    if (replayState) {
      // const text
      const accNumber = new OsuClassicNumber();
      const textures = this.skin.getScoreTextures();
      const overlap = this.skin.config.fonts.scoreOverlap;
      // TODO: Add % sign and comma
      const number = Math.round(gameplayInfo.accuracy * 10000);
      accNumber.prepare({ number, textures, overlap });
      accNumber.position.set(this.widthInPx - 100, 50);
      this.foregroundHUD.addChild(accNumber);
    }

    // verdict counts: 300, 100, 50, miss

    if (replayState) {
      const count = gameplayInfo.verdictCounts;
      const currentCombo = gameplayInfo.currentCombo;
      const maxCombo = gameplayInfo.maxComboSoFar;
      this.statsText.text = `${count[0]}x300, ${count[1]}x100, ${count[2]}x50 ${count[3]}xMisses\ncurrentCombo: ${currentCombo}, maxCombo: ${maxCombo}`;
      this.statsText.position.set(100, 100);
      this.foregroundHUD.addChild(this.statsText);
    }

    // hit error
    {
      // TODO: optimize
      const hits = [];
      if (replayState) {
        for (const [id, s] of replayState.hitCircleState.entries()) {
          const hitCircle = this.context.beatmap.getHitCircle(id);
          const offset = s.judgementTime - hitCircle.hitTime;
          const timeAgo = time - s.judgementTime;
          if (timeAgo >= 0 && timeAgo < 3000) hits.push({ offset, timeAgo, miss: s.type === "MISS" });
        }
      }

      const [hitWindow300, hitWindow100, hitWindow50] = hitWindowsForOD(
        this.context.beatmap.difficulty.overallDifficulty,
      );
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
      this.hitErrorBar.container.position.set(this.widthInPx / 2, this.heightInPx - 30);
      this.hitErrorBar.container.scale.set(2.0);
      this.foregroundHUD.addChild(this.hitErrorBar.container);
    }
  }

  applyBeatmapBackground() {
    const { backgroundDim } = this.context.view;
    const backgroundUrl = "";
    if (this.backgroundUrl !== backgroundUrl) {
      // Do something
    }
  }

  prepare(time: number) {
    this.applyBeatmapBackground();
    this.applyHud(time);
  }
}
