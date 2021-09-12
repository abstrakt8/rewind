import { FaVolumeMute, FaVolumeUp } from "react-icons/all";
import { useCallback, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStageContext } from "../StageProvider/StageProvider";
import { handleButtonFocus } from "../../HandleButtonFocus";
import { AudioSettingsPanel } from "./AudioSettingsPanel";
import produce from "immer";

export const AudioSettingsButton = observer(() => {
  const { audioSettings } = useStageContext();
  const { muted } = audioSettings;
  const [open, setOpen] = useState(false);

  const Icon = useMemo(() => {
    if (muted) {
      return FaVolumeMute;
    }
    return FaVolumeUp;
  }, [muted]);
  const handleClick = useCallback(() => {
    audioSettings.toggleMuted();
  }, [audioSettings]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, [setOpen]);

  const handleMasterVolumeChange = (percentage: number) => {
    audioSettings.applyNewSettings(
      produce(audioSettings.audioSettings, (draft) => {
        draft.volume.master = percentage / 100; //
      }),
    );
  };
  const handleMusicVolumeChange = (percentage: number) => {
    audioSettings.applyNewSettings(
      produce(audioSettings.audioSettings, (draft) => {
        draft.volume.music = percentage / 100; //
      }),
    );
  };

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
            masterVolume={audioSettings.audioSettings.volume.master * 100}
            onMasterVolumeChange={handleMasterVolumeChange}
            musicVolume={audioSettings.audioSettings.volume.music * 100}
            onMusicVolumeChange={handleMusicVolumeChange}
            effectVolume={0}
            onEffectVolumeChange={() => console.log("Not implemented yet!")}
          />
        </div>
      )}
    </div>
  );
});
