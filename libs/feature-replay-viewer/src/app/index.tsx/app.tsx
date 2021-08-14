import * as PIXI from "pixi.js";
import { PerformanceGameClock } from "../../clocks/PerformanceGameClock";

function createApplication() {
  const gameClock = new PerformanceGameClock();
  const ticker = new PIXI.Ticker();
  return {};
}
