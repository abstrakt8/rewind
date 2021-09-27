import { FaVolumeMute, FaVolumeUp } from "react-icons/all";
import { useCallback, useRef, useState } from "react";
import { handleButtonFocus } from "../../HandleButtonFocus";
import { AudioSettingsPanel } from "./AudioSettingsPanel";
import { useTheater } from "../TheaterProvider/TheaterProvider";
import { AudioSettings } from "@rewind/web-player/rewind";
import { useObservable } from "rxjs-hooks/dist/esm";

const defaultSettings: AudioSettings = { volume: { effects: 0, master: 0, music: 0 }, muted: true };

export const AudioSettingsButton = () => {
  const { audioSettingsService } = useTheater();

  const { muted, volume } = useObservable(() => audioSettingsService.settings$, defaultSettings);

  const [open, setOpen] = useState(false);

  const Icon = muted ? FaVolumeMute : FaVolumeUp;

  const handleClick = useCallback(() => {
    audioSettingsService.toggleMuted();
  }, [audioSettingsService]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, [setOpen]);

  const handleMasterVolumeChange = (percentage: number) => audioSettingsService.setMasterVolume(percentage / 100);
  const handleMusicVolumeChange = (percentage: number) => audioSettingsService.setMusicVolume(percentage / 100);

  return (
    <div className={"relative flex align-middle justify-center"}>
      <button
        onFocus={handleButtonFocus}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Icon className={"w-6 h-6"} />
      </button>
      {open && (
        <div
          className={"absolute filter -top-32 drop-shadow-lg"}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AudioSettingsPanel
            masterVolume={volume.master * 100}
            onMasterVolumeChange={handleMasterVolumeChange}
            musicVolume={volume.music * 100}
            onMusicVolumeChange={handleMusicVolumeChange}
            effectVolume={0}
            onEffectVolumeChange={() => console.log("Not implemented yet!")}
          />
        </div>
      )}
    </div>
  );
};
