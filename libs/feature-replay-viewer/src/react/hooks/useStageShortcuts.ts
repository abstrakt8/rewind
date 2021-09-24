import { useHotkeys } from "react-hotkeys-hook";
import { useGameClock } from "../components/StageProvider/StageClockProvider";
import { useStageViewContext } from "../components/StageProvider/StageViewProvider";

// TODO: Configurable

// These should stay constant or make them dynamic depending on gameClock speed
const microscopeJump = 1;
const frameJump = 16; // Assuming 16fps
const mediumJump = 1 * 1000;
const largeJump = 15 * 1000;

const leftKeys = ["a", "left"];
const rightKeys = ["d", "right"];

const upKeys = ["w", "up"];
const downKeys = ["s", "down"];

const generateKeyComboSimple = (keys: string[]) => keys.join(", ");
const generateKeyCombo = (modifier = "", keys: string[]) => keys.map((k) => `${modifier}+${k}`).join(", ");

export function useStageShortcuts() {
  const { toggleClock, increaseSpeed, decreaseSpeed, seekForward, seekBackward } = useGameClock();
  // const { toggleModHidden } = useStageViewContext();

  useHotkeys(generateKeyComboSimple(upKeys), () => increaseSpeed(), [increaseSpeed]);
  useHotkeys(generateKeyComboSimple(downKeys), () => decreaseSpeed(), [decreaseSpeed]);
  useHotkeys("space", () => toggleClock(), [toggleClock]);

  useHotkeys(generateKeyCombo("shift", leftKeys), () => seekBackward(mediumJump), [seekBackward]);
  useHotkeys(generateKeyCombo("shift", rightKeys), () => seekForward(mediumJump), [seekForward]);
  useHotkeys(generateKeyCombo("ctrl", leftKeys), () => seekBackward(microscopeJump), [seekBackward]);
  useHotkeys(generateKeyCombo("ctrl", rightKeys), () => seekForward(microscopeJump), [seekForward]);
  useHotkeys(generateKeyComboSimple(leftKeys), () => seekBackward(frameJump), [seekBackward]);
  useHotkeys(generateKeyComboSimple(rightKeys), () => seekForward(frameJump), [seekForward]);

  // These have really bad collisions
  // useHotkeys(`alt+${leftKey}`, () => seekBackward(frameJump), [seekBackward]);
  // useHotkeys(`alt+${rightKey}`, () => seekForward(frameJump), [seekForward]);
  // useHotkeys(`ctrl+${leftKey}`, () => seekBackward(largeJump), [seekBackward]);
  // useHotkeys(`ctrl+${rightKey}`, () => seekForward(largeJump), [seekForward]);

  // useHotkeys("f", () => toggleModHidden(), [toggleModHidden]);
}
