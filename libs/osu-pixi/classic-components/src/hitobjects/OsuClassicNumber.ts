import { Container, Sprite, Texture } from "pixi.js";

export type OsuClassicNumberSettings = {
  number: number;
  textures: Texture[];
  overlap: number;
};

export const DEFAULT_NUMBER_TEXTURES: Texture[] = Array(10).fill(Texture.EMPTY);

const DEFAULT_NUMBER_SETTINGS: OsuClassicNumberSettings = {
  number: 0,
  textures: DEFAULT_NUMBER_TEXTURES,
  overlap: 0,
};

/**
 * This number can be used for hitCircleCombo, currentCombo and score
 */
export class OsuClassicNumber extends Container {
  private lastNumber = -1;
  private settings: OsuClassicNumberSettings;

  constructor() {
    super();
    this.settings = DEFAULT_NUMBER_SETTINGS;
  }

  prepare(settings: OsuClassicNumberSettings): void {
    this.settings = Object.freeze({ ...this.settings, ...settings });

    const { number, overlap, textures } = this.settings;

    // TODO: Currently we only cache by number, but need to change with other params as well, otherwise we won't see any changes
    // if the overlap or the textures change
    if (this.lastNumber === number) {
      return;
    }

    this.lastNumber = number;
    this.children.forEach((t) => t.destroy(true));
    this.removeChildren();

    let totalWidth = 0;
    const digitSprites: Sprite[] = [];

    let x = number;
    let atLeastOne = false; // So that we can also represent the number 0

    while (x > 0 || !atLeastOne) {
      const digit = Math.floor(x % 10);
      const texture = textures[digit];
      const sprite = new Sprite(texture);
      const addOverlap = digitSprites.length > 0 ? +overlap : 0;
      sprite.anchor.set(1, 0.5);
      sprite.position.set(-totalWidth + addOverlap, 0);
      totalWidth += texture.width;
      digitSprites.push(sprite);
      x = Math.floor(x / 10);
      atLeastOne = true;
    }

    if (digitSprites.length > 1) totalWidth -= overlap;
    // Now shift everything to the center since we started from 0 and worked our way to -totalWidth
    digitSprites.forEach((sprite) => sprite.position.set(sprite.position.x + totalWidth / 2, 0));
    this.addChild(...digitSprites);
  }
}
