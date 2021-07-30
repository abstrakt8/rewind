import { GameClock } from "../clocks/GameClock";
import { ExtendedPlayfieldContainer, PlayfieldBorder } from "@rewind/osu-pixi/classic-components";
import * as PIXI from "pixi.js";
import { IApplicationOptions } from "pixi.js";
import { Container } from "@pixi/display";
import { PerformanceGameClock } from "../clocks/PerformanceGameClock";

// TODO: Maybe move this
export abstract class TestApp extends PIXI.Application {
  // public stats: Stats;
  protected readonly extendedPlayfield: ExtendedPlayfieldContainer;
  protected readonly playfield: Container;
  public clock: GameClock;

  protected constructor(options: IApplicationOptions) {
    super(options);
    // this.stats = new Stats();
    // this.stats.dom.style.cssText =
    //   "position:absolute;top:0;right:0;cursor:pointer;opacity:0.9;z-index:10000";

    this.clock = new PerformanceGameClock();

    // Containers
    this.playfield = new Container();
    this.playfield.addChild(new PlayfieldBorder());
    this.extendedPlayfield = new ExtendedPlayfieldContainer(this.playfield);
    //
    this.stage.addChild(this.extendedPlayfield.container);

    // Otherwise the frames before .initializeTicker() is called might look weird
    this.resizeCanvasToDisplaySize(this.view);
  }

  // `async` modifier ?
  abstract initializeAssets(): Promise<unknown>;

  abstract initializePlayfield(): void;

  abstract prepare(time: number): void;

  initializeTicker(): void {
    this.ticker.add(() => {
      // this.stats.begin();
      this.resizeCanvasToDisplaySize(this.view);
      this.prepare(this.clock.getCurrentTime());
      this.renderer.render(this.stage);
      // this.stats.end();
    });
  }

  resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // If it's resolution does not match change it
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      this.renderer.resize(canvas.width, canvas.height);
      this.extendedPlayfield.resizeTo(canvas.width, canvas.height);
      return true;
    }

    return false;
  }
}
