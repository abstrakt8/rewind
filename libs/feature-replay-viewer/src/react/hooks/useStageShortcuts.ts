import { useHotkeys } from "react-hotkeys-hook";
import { useGameClockContext } from "../components/StageProvider/StageClockProvider";
import { useStageViewContext } from "../components/StageProvider/StageViewProvider";

// TODO: Configurable
const leftKey = "a";
const rightKey = "d";
// const leftKey = "left";
// const rightKey = "right";

// These should stay constant or make them dynamic depending on gameClock speed
const microscopeJump = 1;
const frameJump = 16; // Assuming 16fps
const mediumJump = 1 * 1000; // 3s
const largeJump = 15 * 1000; // 15s

export function useStageShortcuts() {
  const { toggleClock, increaseSpeed, decreaseSpeed, seekForward, seekBackward } = useGameClockContext();
  const { toggleModHidden } = useStageViewContext();

  useHotkeys("w", () => increaseSpeed(), [increaseSpeed]);
  useHotkeys("s", () => decreaseSpeed(), [decreaseSpeed]);
  useHotkeys("space", () => toggleClock(), [toggleClock]);

  useHotkeys(`shift+${leftKey}`, () => seekBackward(microscopeJump), [seekBackward]);
  useHotkeys(`shift+${rightKey}`, () => seekForward(microscopeJump), [seekForward]);
  useHotkeys(`shift+alt+${leftKey}`, () => seekBackward(frameJump), [seekBackward]);
  useHotkeys(`shift+alt+${rightKey}`, () => seekForward(frameJump), [seekForward]);
  useHotkeys(leftKey, () => seekBackward(mediumJump), [seekBackward]);
  useHotkeys(rightKey, () => seekForward(mediumJump), [seekForward]);

  // These have really bad collisions
  // useHotkeys(`alt+${leftKey}`, () => seekBackward(frameJump), [seekBackward]);
  // useHotkeys(`alt+${rightKey}`, () => seekForward(frameJump), [seekForward]);
  // useHotkeys(`ctrl+${leftKey}`, () => seekBackward(largeJump), [seekBackward]);
  // useHotkeys(`ctrl+${rightKey}`, () => seekForward(largeJump), [seekForward]);

  useHotkeys("f", () => toggleModHidden(), [toggleModHidden]);
}
