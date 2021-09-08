import { FaVolumeMute, FaVolumeUp } from "react-icons/all";
import { useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStageContext } from "./components/StageProvider/StageProvider";
import { handleButtonFocus } from "./HandleButtonFocus";

export const AudioSettingButton = observer(() => {
  const { audioSettings } = useStageContext();
  const { muted } = audioSettings;
  const icon = useMemo(() => {
    if (muted) {
      return <FaVolumeMute />;
    }
    return <FaVolumeUp />;
  }, [muted]);
  const handleClick = useCallback(() => {
    audioSettings.toggleMuted();
  }, [audioSettings]);
  return (
    <button onFocus={handleButtonFocus} onClick={handleClick}>
      {icon}
    </button>
  );
});
