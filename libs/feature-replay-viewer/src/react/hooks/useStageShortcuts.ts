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
const mediumJump = 0.5 * 1000;
const largeJump = 15 * 1000;

const leftKeys = ["a", "left"];
const rightKeys = ["d", "right"];
const generateKeyCombo = (modifier = "", keys: string[]) => keys.map((k) => `${modifier}+${k}`).join(", ");

export function useStageShortcuts() {
  const { toggleClock, increaseSpeed, decreaseSpeed, seekForward, seekBackward } = useGameClockContext();
  const { toggleModHidden } = useStageViewContext();

  useHotkeys("w", () => increaseSpeed(), [increaseSpeed]);
  useHotkeys("s", () => decreaseSpeed(), [decreaseSpeed]);
  useHotkeys("space", () => toggleClock(), [toggleClock]);

  useHotkeys(generateKeyCombo("shift", leftKeys), () => seekBackward(microscopeJump), [seekBackward]);
  useHotkeys(generateKeyCombo("shift", rightKeys), () => seekForward(microscopeJump), [seekForward]);
  useHotkeys(generateKeyCombo("shift+alt", leftKeys), () => seekBackward(frameJump), [seekBackward]);
  useHotkeys(generateKeyCombo("shift+alt", rightKeys), () => seekForward(frameJump), [seekForward]);
  useHotkeys(leftKeys.join(", "), () => seekBackward(mediumJump), [seekBackward]);
  useHotkeys(rightKeys.join(", "), () => seekForward(mediumJump), [seekForward]);

  // These have really bad collisions
  // useHotkeys(`alt+${leftKey}`, () => seekBackward(frameJump), [seekBackward]);
  // useHotkeys(`alt+${rightKey}`, () => seekForward(frameJump), [seekForward]);
  // useHotkeys(`ctrl+${leftKey}`, () => seekBackward(largeJump), [seekBackward]);
  // useHotkeys(`ctrl+${rightKey}`, () => seekForward(largeJump), [seekForward]);

  useHotkeys("f", () => toggleModHidden(), [toggleModHidden]);
}
