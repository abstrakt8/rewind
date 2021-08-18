import { Texture } from "pixi.js";
import { RewindTextureId } from "../theater/TextureManager";

export const TYPES = {
  THEATER_STAGE_PREPARER: Symbol.for("THEATER_STAGE_PREPARER"),
  REPLAY: Symbol.for("REPLAY"),
  BEATMAP: Symbol.for("BEATMAP"),
  AUDIO_CONTEXT: Symbol.for("AUDIO_CONTEXT"),
  SONG_URL: Symbol.for("SONG_URL"),
  EVENT_EMITTER: Symbol.for("EVENT_EMITTER"),
  TEXTURE_MAP: Symbol.for("TEXTURE_MAP"),
};

export type RewindTextureMap = Map<RewindTextureId, Texture>;
