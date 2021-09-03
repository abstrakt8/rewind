import { useStageContext } from "@rewind/feature-replay-viewer";
import { FaVolumeMute, FaVolumeUp } from "react-icons/all";
import { useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";

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
  return <button onClick={handleClick}>{icon}</button>;
});
