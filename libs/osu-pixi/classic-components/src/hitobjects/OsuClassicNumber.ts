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

function calculateDigits(x: number) {
  if (x === 0) {
    return [0];
  }
  const d = [];
  while (x > 0) {
    d.push(x % 10);
    x = Math.floor(x / 10);
  }
  d.reverse();
  return d;
}

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

    // TODO: Currently we only cache by number, but need to change with other params as well, otherwise we won't see
    // any changes if the overlap or the textures change
    // MAybe instead of Number pass araray of digits
    if (this.lastNumber === number) {
      return;
    }

    this.lastNumber = number;
    this.children.forEach((t) => t.destroy(true));
    this.removeChildren();

    let totalWidth = 0;
    const digitSprites: Sprite[] = [];

    const digits = calculateDigits(number);
    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i];
      const texture = textures[digit];
      const sprite = new Sprite(texture);
      const addOverlap = i > 0 ? -overlap : 0; //
      sprite.anchor.set(0, 0.5);
      sprite.position.set(totalWidth + addOverlap, 0);
      totalWidth += texture.width + addOverlap;
      digitSprites.push(sprite);
    }
    // Now shift everything to the center since we started from 0 and worked our way to totalWidth
    digitSprites.forEach((sprite) => sprite.position.set(sprite.position.x - totalWidth / 2, 0));
    this.addChild(...digitSprites);
  }
}
