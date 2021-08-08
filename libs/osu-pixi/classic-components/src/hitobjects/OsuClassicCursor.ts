import { PrepareSetting } from "../utils/Preparable";
import { Texture } from "pixi.js";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { createCenteredSprite } from "../utils/Pixi";
import { Position, Vec2 } from "@rewind/osu/math";

const MAX_CURSOR_TRAILS = 8;

export interface OsuClassicCursorSetting {
  // The position of the cursor
  position: Position;

  // 0th trail is the earliest and will have the highest alpha, the others will "fade out" just like in OsuClassic
  // If you need to hide the cursor trail then just set this to `[]`.
  trailPositions: Position[];

  // If you need something like "scale with CS", then set this accordingly
  cursorScale: number;

  cursorTexture: Texture;
  cursorTrailTexture: Texture;

  // Customizable fade out easing function?
}

const defaultSettings: OsuClassicCursorSetting = {
  position: { x: 0, y: 0 },
  trailPositions: [],
  cursorScale: 1.0,
  cursorTexture: Texture.EMPTY,
  cursorTrailTexture: Texture.EMPTY,
};

/**
 * Cursor also has some animations -> for example when clicking it can expand or not depending on the setting.
 *
 * This implementation initializes a set of MAX_CURSOR cursor trail sprites.
 */
export class OsuClassicCursor implements PrepareSetting<OsuClassicCursorSetting> {
  public container: Container;
  private readonly cursorSprite: Sprite;
  private readonly cursorTrailSprites: Sprite[];
  private settings: OsuClassicCursorSetting; // So caching can be done later ...

  constructor() {
    this.container = new Container();
    this.settings = defaultSettings;
    this.cursorSprite = createCenteredSprite();
    this.cursorTrailSprites = [];
    for (let i = 0; i < MAX_CURSOR_TRAILS; i++) this.cursorTrailSprites.push(createCenteredSprite());

    // We will add those sprites in reverse because the cursor should be ON TOP of the others.
    for (let i = 0; i < MAX_CURSOR_TRAILS; i++) {
      this.container.addChild(this.cursorTrailSprites[MAX_CURSOR_TRAILS - i - 1]);
    }
    this.container.addChild(this.cursorSprite);
    this.container.position.set(0, 0);
  }

  prepare(setting: Partial<OsuClassicCursorSetting>): void {
    this.settings = { ...this.settings, ...setting };

    const { cursorScale, cursorTexture, cursorTrailTexture, trailPositions, position } = this.settings;

    this.cursorSprite.texture = cursorTexture;

    // The cursor is centered in the container at (0, 0) and the container is the one that gets "moved" around.
    // The cursor trails have their positions relative to (0, 0) basically.
    this.cursorSprite.position.set(position.x, position.y);
    this.cursorSprite.scale.set(cursorScale);
    // this.container.position.set(position.x, position.y);
    this.cursorTrailSprites.forEach((cts, i) => {
      cts.texture = cursorTrailTexture;
      if (i < trailPositions.length) {
        // const offset = Vec2.sub(trailPositions[i], position);
        cts.position.set(trailPositions[i].x, trailPositions[i].y);
        cts.alpha = (trailPositions.length - i) / trailPositions.length; // Linear (but might be configurable)
        cts.scale.set(cursorScale);
      } else {
        cts.alpha = 0;
      }
    });
    // this.container.scale.set(cursorScale);
  }
}
