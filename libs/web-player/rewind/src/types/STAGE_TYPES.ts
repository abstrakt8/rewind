import { Texture } from "pixi.js";
import { RewindTextureId } from "../TextureManager";

export const STAGE_TYPES = {
  THEATER_STAGE_PREPARER: Symbol.for("THEATER_STAGE_PREPARER"),
  REPLAY: Symbol.for("REPLAY"),
  BEATMAP: Symbol.for("BEATMAP"),
  AUDIO_CONTEXT: Symbol.for("AUDIO_CONTEXT"),
  SONG_URL: Symbol.for("SONG_URL"),
  EVENT_EMITTER: Symbol.for("EVENT_EMITTER"),
  TEXTURE_MAP: Symbol.for("TEXTURE_MAP"),
  INITIAL_VIEW_SETTINGS: Symbol.for("INITIAL_VIEW_SETTINGS"),
};

export type RewindTextureMap = Map<RewindTextureId, Texture>;
