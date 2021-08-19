import { useHotkeys } from "react-hotkeys-hook";
import { useGameClockContext } from "../components/StageProvider/StageClockProvider";
import { useStageViewContext } from "../components/StageProvider/StageViewProvider";

export function useStageShortcuts() {
  const { toggleClock, increaseSpeed, decreaseSpeed } = useGameClockContext();
  const { toggleModHidden } = useStageViewContext();

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
