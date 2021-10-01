import { useTheater } from "@rewind/feature-replay-viewer";
import { useObservable } from "rxjs-hooks";
import { AudioSettings } from "@rewind/web-player/rewind";

export function useAudioSettingsService() {
  const theater = useTheater();
  return theater.audioSettingsService;
}

const defaultSettings: AudioSettings = { volume: { effects: 0, master: 0, music: 0 }, muted: true };

export function useAudioSettings() {
  const audioSettingsService = useAudioSettingsService();
  return useObservable(() => audioSettingsService.settings$, defaultSettings);
}
