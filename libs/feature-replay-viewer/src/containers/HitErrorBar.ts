import { Container, Graphics, Sprite, Texture } from "pixi.js";
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
const barHeight = 5;
const totalHeight = 15;

function coloredSprite(color: number) {
  const sprite = new Sprite(Texture.WHITE);
  sprite.tint = color;
  sprite.anchor.set(0.5);

  return sprite;
}

export class AnalysisHitErrorBar {
  container: Container;
  bg50: Sprite;
  bg100: Sprite;
  bg300: Sprite;
  center: Sprite;

  constructor() {
    this.container = new Container();
    this.bg50 = coloredSprite(color50);
    this.bg100 = coloredSprite(color100);
    this.bg300 = coloredSprite(color300);
    this.center = coloredSprite(0xffffff);

    this.bg50.height = this.bg100.height = this.bg300.height = barHeight;
    this.center.height = totalHeight;
    this.center.width = 1;
    this.center.position.set(-0.5);

    this.container.addChild(this.bg50, this.bg100, this.bg300, this.center);
  }

  prepare(setting: AnalysisHitErrorBarSettings) {
    const { hitWindow50, hitWindow100, hitWindow300 } = setting;

    this.bg50.width = hitWindow50 * 2;
    this.bg100.width = hitWindow100 * 2;
    this.bg300.width = hitWindow300 * 2;
  }
}
