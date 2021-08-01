import { Container, Graphics } from "pixi.js";
import { rgbToInt } from "@rewind/osu/math";

// fixed width
export interface AnalysisHitErrorBarSettings {
  hitWindow50: number;
  hitWindow100: number;
  hitWindow300: number;
}

// https://github.com/McKay42/McOsu/commit/b5803cd37dd3c27741b76744b5d141f425e9b33c
const color300 = rgbToInt([50, 188, 231]);
const color100 = rgbToInt([87, 227, 19]);
const color50 = rgbToInt([218, 174, 70]);
const height = 5;

export class AnalysisHitErrorBar {
  container: Container;
  bg50: Graphics;
  bg100: Graphics;
  bg300: Graphics;

  constructor() {
    this.container = new Container();
    this.bg50 = new Graphics();
    this.bg100 = new Graphics();
    this.bg300 = new Graphics();

    this.container.addChild(this.bg50, this.bg100, this.bg300);
  }

  prepare(setting: AnalysisHitErrorBarSettings) {
    const { hitWindow50, hitWindow100, hitWindow300 } = setting;

    this.bg50.clear();
    this.bg100.clear();
    this.bg300.clear();

    this.bg50.beginFill(color50);
    this.bg50.drawRect(-hitWindow50, 0, hitWindow50 * 2, height);
    this.bg50.endFill();

    this.bg100.beginFill(color100);
    this.bg100.drawRect(-hitWindow100, 0, hitWindow100 * 2, height);
    this.bg100.endFill();

    this.bg300.beginFill(color300);
    this.bg300.drawRect(-hitWindow300, 0, hitWindow300 * 2, height);
    this.bg300.endFill();
  }
}
