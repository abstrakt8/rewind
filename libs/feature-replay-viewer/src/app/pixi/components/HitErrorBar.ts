import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { applyInterpolation, rgbToInt } from "@rewind/osu/math";

// fixed width

type HitEvent = {
  offset: number;
  timeAgo: number;
  miss?: boolean;
};

export interface AnalysisHitErrorBarSettings {
  hitWindow50: number;
  hitWindow100: number;
  hitWindow300: number;
  hits: HitEvent[];
}

// https://github.com/McKay42/McOsu/commit/b5803cd37dd3c27741b76744b5d141f425e9b33c
const color300 = rgbToInt([50, 188, 231]);
const color100 = rgbToInt([87, 227, 19]);
const color50 = rgbToInt([218, 174, 70]);
const colorMiss = rgbToInt([255, 0, 0]);
const barHeight = 5;
const hitHeight = 15;

function coloredSprite(color: number) {
  const sprite = new Sprite(Texture.WHITE);
  sprite.tint = color;
  sprite.anchor.set(0.5);

  return sprite;
}

// TODO: Move to osu-classic ?
// We can have a more advanced one here
export class AnalysisHitErrorBar {
  container: Container;
  bg50: Sprite;
  bg100: Sprite;
  bg300: Sprite;
  center: Sprite;

  hitsContainer: Container;

  constructor() {
    this.container = new Container();
    this.hitsContainer = new Container();
    this.bg50 = coloredSprite(color50);
    this.bg100 = coloredSprite(color100);
    this.bg300 = coloredSprite(color300);
    this.center = coloredSprite(0xffffff);

    this.bg50.height = this.bg100.height = this.bg300.height = barHeight;
    this.center.height = hitHeight;
    this.center.width = 1;
    this.center.position.set(-0.5, 0);

    this.container.addChild(this.bg50, this.bg100, this.bg300, this.center, this.hitsContainer);
  }

  prepare(setting: AnalysisHitErrorBarSettings) {
    const { hitWindow50, hitWindow100, hitWindow300, hits } = setting;

    function colorFromHitEvent(hitEvent: HitEvent) {
      if (hitEvent.miss) return colorMiss;
      if (Math.abs(hitEvent.offset) <= hitWindow300) return color300;
      if (Math.abs(hitEvent.offset) <= hitWindow100) return color100;
      if (Math.abs(hitEvent.offset) <= hitWindow50) return color50;
      return colorMiss;
    }

    this.bg50.width = hitWindow50 * 2;
    this.bg100.width = hitWindow100 * 2;
    this.bg300.width = hitWindow300 * 2;

    this.hitsContainer.removeChildren();
    hits.forEach((h) => {
      const s = coloredSprite(colorFromHitEvent(h));
      s.width = 1;
      s.height = hitHeight;
      s.position.set(h.offset, 0);
      s.alpha = applyInterpolation(h.timeAgo, 0, 3000, 1.0, 0.0);
      this.hitsContainer.addChild(s);
    });
  }
}
