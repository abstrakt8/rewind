import * as PIXI from "pixi.js";
import { GameClock } from "../clocks/GameClock";
import { BasicSliderTextureRenderer, PlayfieldBorder, SliderTextureManager } from "@rewind/osu-pixi/classic-components";
import { OsuReplay } from "../managers/ReplayManager";
import {
  BeatmapBuilder,
  Blueprint,
  BucketedReplayStateTimeMachine,
  DEFAULT_BEATMAP_DIFFICULTY,
  NoteLockStyle,
  StaticBeatmap,
} from "@rewind/osu/core";
import { OsuGameplayContainer } from "../containers/OsuGameplayContainer";
import { PerformanceMonitor } from "../utils/PerformanceMonitor";
import { Skin } from "../skins/Skin";
import { ViewSettings } from "../ViewSettings";
import { hitWindowsForOD } from "@rewind/osu/math";
import { MyExtendedPlayfieldContainer } from "../containers/MyExtendedPlayfieldContainer";

/**
 * One beatmap / replay that can be viewed.
 * Optionally, the replay can be left empty and the application is just a beatmap viewer.
 * One way to make a live stream replay viewer (which means replay is not fully finished yet) is to periodically
 * request for more frames (from a service).
 *
 * For more sophisticated views (such as a tournament client or the knockouts in Danser), you need to
 * create a new "app".
 */
export class ReplayViewerApp {
  // public stats: Stats;
  public clock: GameClock;

  private app: PIXI.Application;
  protected extendedPlayfield: MyExtendedPlayfieldContainer;
  private osuGameplayContainer: OsuGameplayContainer;
  private beatmap: StaticBeatmap;
  private sliderTextureManager: SliderTextureManager;

  private playfieldBorder: PlayfieldBorder;

  private ticker?: PIXI.Ticker;

  // TODO: Maybe change depending on resizeTo
  // 1080px * 80% / 384px = 2.25 (good enough for 1920x1080 fullscreen)
  private osuSliderResolution = 2.25;

  private performanceMonitor?: PerformanceMonitor;

  constructor(settings: { app: PIXI.Application; clock: GameClock; performanceMonitor?: PerformanceMonitor }) {
    this.app = settings.app;
    this.clock = settings.clock;
    this.performanceMonitor = settings.performanceMonitor;

    this.beatmap = new StaticBeatmap([], DEFAULT_BEATMAP_DIFFICULTY);

    // Containers
    this.playfieldBorder = new PlayfieldBorder();
    this.sliderTextureManager = new SliderTextureManager(
      new BasicSliderTextureRenderer(this.app.renderer as PIXI.Renderer),
      this.osuSliderResolution,
    );
    this.osuGameplayContainer = new OsuGameplayContainer(this.playfieldBorder, this.sliderTextureManager);
    this.extendedPlayfield = new MyExtendedPlayfieldContainer(this.osuGameplayContainer.container);
    //
    this.app.stage.addChild(this.extendedPlayfield.container);

    // Otherwise the frames before .initializeTicker() is called might look weird
    this.resizeCanvasToDisplaySize(this.app.view);
    this.tickHandler = this.tickHandler.bind(this);
  }

  /**
   * Changes the skin to the provided one. It will have an immediate effect on the next render.
   */
  applySkin(skin: Skin) {
    // TODO: THIS IS UGLY
    this.osuGameplayContainer.skin = skin;
    this.extendedPlayfield.skin = skin;
  }

  /**
   * The replay scenario will take the mods that are in the replay
   * @param blueprint the .osu blueprint
   * @param replay
   */
  applyReplayScenario(blueprint: Blueprint, replay: OsuReplay): void {
    const beatmapBuilder = new BeatmapBuilder(true);
    const mods = []; // TODO: Depends on replay
    const beatmap = beatmapBuilder.buildBeatmap(blueprint, []); // how does this data get to top?
    this.osuGameplayContainer.hitObjects = beatmap.hitObjects;
    this.osuGameplayContainer.replayFrames = replay.frames;

    const replayTimeMachine = new BucketedReplayStateTimeMachine(replay.frames, beatmap.hitObjects, {
      hitWindows: hitWindowsForOD(beatmap.difficulty.overallDifficulty),
      noteLockStyle: NoteLockStyle.STABLE,
    });
    this.osuGameplayContainer.replayTimeMachine = replayTimeMachine;
    this.extendedPlayfield.replayTimeMachine = replayTimeMachine;
    // TODO: Maybe some precalculation

    this.clock.seekTo(0); // Might be necessary because what if the last replay was at t=300s and this one only has 30s?
  }

  // From where do I get the beatmap background ?
  applyBeatmapScenario(blueprint: Blueprint, mods: any[]) {
    const beatmapBuilder = new BeatmapBuilder(true);
    const beatmap = beatmapBuilder.buildBeatmap(blueprint, []); // how does this data get to top?
    this.osuGameplayContainer.hitObjects = beatmap.hitObjects;
    this.osuGameplayContainer.replayFrames = [];
    this.osuGameplayContainer.replayTimeMachine = undefined;
    this.extendedPlayfield.replayTimeMachine = undefined;
    this.clock.seekTo(0);
  }

  applySettings(viewSettings: ViewSettings) {
    this.osuGameplayContainer.viewSettings = viewSettings;
  }

  prepare(time: number): void {
    this.osuGameplayContainer.prepare(time);
    this.extendedPlayfield.prepare(time);
  }

  private tickHandler() {
    this.performanceMonitor?.begin();
    this.resizeCanvasToDisplaySize(this.app.view);
    this.prepare(this.clock.getCurrentTime());
    this.app.renderer.render(this.app.stage);
    this.performanceMonitor?.end();
  }

  initializeTicker(): void {
    // Restart ticker
    this.app.ticker.remove(this.tickHandler);
    this.app.ticker.add(this.tickHandler);
  }

  private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // If it's resolution does not match change it
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      this.app.renderer.resize(canvas.width, canvas.height);
      this.extendedPlayfield.resizeTo(canvas.width, canvas.height);
      return true;
    }

    return false;
  }
}
