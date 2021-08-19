import { useHotkeys } from "react-hotkeys-hook";
import { useGameClockContext } from "../components/StageProvider/StageClockProvider";
import { useStageViewContext } from "../components/StageProvider/StageViewProvider";

export function useStageShortcuts() {
  const { toggleClock, increaseSpeed, decreaseSpeed, seekForward, seekBackward } = useGameClockContext();
  const { toggleModHidden } = useStageViewContext();

  useHotkeys("w", () => increaseSpeed(), [increaseSpeed]);
  useHotkeys("s", () => decreaseSpeed(), [decreaseSpeed]);
  useHotkeys("space", () => toggleClock(), [toggleClock]);

  const leftKey = "a";
  const rightKey = "d";
  useHotkeys(`shift+${leftKey}`, () => seekBackward(1), [seekBackward]);
  useHotkeys(`shift+${rightKey}`, () => seekForward(1), [seekForward]);
  useHotkeys(leftKey, () => seekBackward(16), [seekBackward]);
  useHotkeys(rightKey, () => seekForward(16), [seekForward]);

  useHotkeys("f", () => toggleModHidden(), [toggleModHidden]);
}
