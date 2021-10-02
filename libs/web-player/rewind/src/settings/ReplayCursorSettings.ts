import { CursorSettings } from "./CursorSettings";

export interface ReplayCursorSettings extends CursorSettings {
  showTrail: boolean;
  // Maybe there will be a smooth cursor trail
}

export const DEFAULT_REPLAY_CURSOR_SETTINGS: ReplayCursorSettings = Object.freeze({
  showTrail: true,
  scale: 0.8,
  enabled: true,
  scaleWithCS: true,
});
