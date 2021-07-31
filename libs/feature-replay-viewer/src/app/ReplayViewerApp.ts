import * as PIXI from "pixi.js";
import { GameClock } from "../clocks/GameClock";
import { BasicSliderTextureRenderer, SliderTextureManager } from "@rewind/osu-pixi/classic-components";
import { OsuGameplayContainer } from "../containers/OsuGameplayContainer";
import { PerformanceMonitor } from "../utils/PerformanceMonitor";
import { MyExtendedPlayfieldContainer } from "../containers/MyExtendedPlayfieldContainer";
import { ReplayViewerContext } from "../containers/ReplayViewerContext";
import { defaultViewSettings } from "../ViewSettings";
import { Skin } from "../skins/Skin";

interface ReplayViewerAppSettings {
  view: HTMLCanvasElement;
  // MobX domain elements
  clock: GameClock;

  // Maybe construct performance monitor inside if not given?
  performanceMonitor?: PerformanceMonitor;
}

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

  // private beatmap: StaticBeatmap;
  private readonly sliderTextureManager: SliderTextureManager;

  // TODO: Maybe change depending on resizeTo events -> for now it is good enough for 1920x1080 fullscreen
  // 1080px * 80% / 384px = 2.25 (good enough for 1920x1080 fullscreen)
  private osuSliderResolution = 2.25;

  private performanceMonitor?: PerformanceMonitor;
  public context: ReplayViewerContext;

  constructor(settings: ReplayViewerAppSettings) {
    this.app = new PIXI.Application({ view: settings.view, antialias: true });
    this.clock = settings.clock;
    this.performanceMonitor = settings.performanceMonitor;

    // this.beatmap = new StaticBeatmap([], DEFAULT_BEATMAP_DIFFICULTY);
    this.context = {
      view: defaultViewSettings(),
      hitObjects: [],
      skin: Skin.EMPTY,
    };

    // Containers
    this.sliderTextureManager = new SliderTextureManager(
      new BasicSliderTextureRenderer(this.app.renderer as PIXI.Renderer),
      this.osuSliderResolution,
    );
    this.osuGameplayContainer = new OsuGameplayContainer(this.sliderTextureManager, this.context);
    this.extendedPlayfield = new MyExtendedPlayfieldContainer(this.osuGameplayContainer.container, this.context);
    this.app.stage.addChild(this.extendedPlayfield.container);

    // As a small optimization to prevent the "mouseover" events from being fired.
    // https://github.com/pixijs/pixijs/issues/5625#issuecomment-487946766
    // const interactionDOMElement = this.app.renderer.plugins.interaction.interactionDOMElement;
    // this.app.renderer.plugins.interaction.removeEvents();
    // this.app.renderer.plugins.interaction.supportsPointerEvents = false;
    // this.app.renderer.plugins.interaction.setTargetElement(interactionDOMElement);
    this.app.stage.interactive = false;
    this.app.stage.interactiveChildren = false;

    this.initializeTicker();
    // In case we don't initialize ticker, we should resize canvas initially
    // this.resizeCanvasToDisplaySize(this.app.view);
  }

  // Can be thought of ReactDOM.render({time}), and PixiJS/Canvas is the DOM that does its rendering with PIXI.renderer
  prepare(time: number): void {
    // TODO: Technically speaking we could also not pass the time
    this.osuGameplayContainer.prepare(time);
    this.extendedPlayfield.prepare(time);
  }

  initializeTicker(): void {
    // // Restart ticker
    // this.app.ticker.remove(this.tickHandler);
    const tickHandler = () => {
      this.performanceMonitor?.begin();
      this.resizeCanvasToDisplaySize(this.app.view);
      this.prepare(this.clock.getCurrentTime());
      this.app.renderer.render(this.app.stage);
      this.performanceMonitor?.end();
    };
    this.app.ticker.add(tickHandler);
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
