import { injectable } from "inversify";
import { AudioSettings, DEFAULT_AUDIO_SETTINGS } from "../settings/AudioSettings";
import { AbstractSettingsStore } from "./AbstractSettingsStore";

@injectable()
export class AudioSettingsStore extends AbstractSettingsStore<AudioSettings> {
  constructor() {
    super(DEFAULT_AUDIO_SETTINGS);
  }

  toggleMuted() {
    this.changeSettings((d) => (d.muted = !d.muted));
  }

  setMasterVolume(volume: number) {
    this.changeSettings((d) => (d.volume.master = volume));
  }

  setMusicVolume(volume: number) {
    this.changeSettings((d) => (d.volume.music = volume));
  }

  setEffectsVolume(volume: number) {
    this.changeSettings((d) => (d.volume.effects = volume));
  }

  setMuted(muted: boolean) {
    this.changeSettings((d) => (d.muted = muted));
  }
}
