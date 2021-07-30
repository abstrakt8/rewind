import * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import { OSU_PLAYFIELD_BASE_X, OSU_PLAYFIELD_BASE_Y } from "./ExtendedPlayfieldContainer";

// thickness in osu!px
type PlayfieldBorderStyle = { type?: any; thickness: number };

export class PlayfieldBorder extends Graphics {
  style: PlayfieldBorderStyle;

  constructor(style?: PlayfieldBorderStyle) {
    super();
    this.style = Object.assign({ type: "full", thickness: 2 }, style);
  }

  render(renderer: PIXI.Renderer): void {
    super.render(renderer);
    // The thickness is defined by the osu!px x value.
    this.clear();
    // TODO: Add more options for color, alpha
    this.lineStyle(this.style.thickness, 0xffffff, 0.7);
    // TODO: Are there off by one errors here? (or more?)
    this.drawRect(0, 0, OSU_PLAYFIELD_BASE_X, OSU_PLAYFIELD_BASE_Y);
  }
}
