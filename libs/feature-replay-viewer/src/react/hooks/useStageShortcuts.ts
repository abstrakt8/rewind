import { useHotkeys } from "react-hotkeys-hook";
import { useGameClockControls } from "./useGameClock";
import { useStageViewSettings } from "./useStageViewSettings";

export function useStageShortcuts() {
  const { toggleClock, increaseSpeed, decreaseSpeed } = useGameClockControls();
  const { toggleModHidden } = useStageViewSettings();

  useHotkeys("w", () => increaseSpeed(), [increaseSpeed]);
  useHotkeys("s", () => decreaseSpeed(), [decreaseSpeed]);
  useHotkeys("space", () => toggleClock(), [toggleClock]);
  // useHotkeys("d", () => gameClock.seekTo(Math.min(gameClock.maxTime, gameClock.getCurrentTime() + frameJump)), [
  //   gameClock,
  //   frameJump,
  // ]);
  // useHotkeys("a", () => gameClock.seekTo(Math.max(0, gameClock.getCurrentTime() - frameJump)), [gameClock,
  // frameJump]);

  useHotkeys("f", () => toggleModHidden(), [toggleModHidden]);
}
