import { useCommonManagers } from "../providers/TheaterProvider";
import { useObservable } from "rxjs-hooks";
import { AudioSettings } from "../services/common/AudioSettingsStore";

export function useAudioSettingsService() {
  const theater = useCommonManagers();
  return theater.audioSettingsService;
}

const defaultSettings: AudioSettings = { volume: { effects: 0, master: 0, music: 0 }, muted: true };

export function useAudioSettings() {
  const audioSettingsService = useAudioSettingsService();
  return useObservable(() => audioSettingsService.settings$, defaultSettings);
}
