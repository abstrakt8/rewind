import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { DEFAULT_REPLAY_CURSOR_SETTINGS, ReplayCursorSettings } from "../settings/ReplayCursorSettings";

export class ReplayCursorSettingsStore extends AbstractSettingsStore<ReplayCursorSettings> {
  constructor() {
    super(DEFAULT_REPLAY_CURSOR_SETTINGS);
  }
}
