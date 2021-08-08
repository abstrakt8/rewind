import * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import { OSU_PLAYFIELD_BASE_X, OSU_PLAYFIELD_BASE_Y } from "./ExtendedPlayfieldContainer";
import { circleSizeToScale } from "@rewind/osu/math";

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
      this.graphics.drawRect(-cs4, -cs4, OSU_PLAYFIELD_BASE_X + cs4, OSU_PLAYFIELD_BASE_Y + cs4);
    }
    // TODO: Add more options for color, alpha
    // TODO: Are there off by one errors here? (or more?)
  }
}
