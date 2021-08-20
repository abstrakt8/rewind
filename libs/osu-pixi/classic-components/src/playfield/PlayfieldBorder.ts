import { Graphics } from "pixi.js";
import { circleSizeToScale } from "@rewind/osu/math";
import { OSU_PLAYFIELD_HEIGHT, OSU_PLAYFIELD_WIDTH } from "../utils/constants";

// Thickness in osu!px
type PlayfieldBorderSettings = {
  enabled: boolean;
  thickness: number;
  // Type : Full, Corners, ...
  // Maybe also
};

const cs4 = circleSizeToScale(4) * 64;

export class PlayfieldBorder {
  graphics: Graphics;

  constructor() {
    this.graphics = new Graphics();
  }

  prepare(settings: PlayfieldBorderSettings) {
    const { thickness, enabled } = settings;
    this.graphics.clear();

    if (enabled) {
      // TODO: Alpha configurable?
      this.graphics.lineStyle(thickness, 0xffffff, 0.7);
      // this.graphics.drawRect(0, 0, OSU_PLAYFIELD_WIDTH, OSU_PLAYFIELD_HEIGHT);
      const offsetX = cs4;
      const offsetY = cs4 / (4 / 3);

      this.graphics.drawRect(-offsetX, -offsetY, OSU_PLAYFIELD_WIDTH + offsetX * 2, OSU_PLAYFIELD_HEIGHT + offsetY * 2);
    }
    // TODO: Add more options for color, alpha
    // TODO: Are there off by one errors here? (or more?)
  }
}
