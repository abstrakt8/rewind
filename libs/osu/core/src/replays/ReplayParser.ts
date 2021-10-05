import { OsuAction, ReplayButtonState, ReplayFrame } from "./Replay";

const MAX_COORDINATE_VALUE = 131072;
// LegacyScoreDecoder.cs
// PowerOfTwo bit
const bitmaskCheck = (mask: number, bit: number): boolean => (mask & bit) !== 0;
export const parseReplayFramesFromRaw = (rawString: string): ReplayFrame[] => {
  const frameStrings = rawString.split(",");
  let lastTime = 0;
  const frames: ReplayFrame[] = [];
  for (let i = 0; i < frameStrings.length; i++) {
    const split = frameStrings[i].split("|");
    if (split.length < 4) continue;

    if (split[0] === "-12345") {
      // osu-lazer-comment: The seed is provided in split[3], which we'll need to use at some point
      continue;
    }

    const diff = parseFloat(split[0]);
    const mouseX = parseFloat(split[1]);
    const mouseY = parseFloat(split[2]);
    if (Math.abs(mouseX) > MAX_COORDINATE_VALUE || Math.abs(mouseY) > MAX_COORDINATE_VALUE) {
      throw Error("Value overflow while parsing mouse coordinates");
    }
    lastTime += diff;
    if (i < 2 && mouseX === 256 && mouseY === -500)
      // at the start of the replay, stable places two replay frames, at time 0 and SkipBoundary - 1, respectively.
      // both frames use a position of (256, -500).
      // ignore these frames as they serve no real purpose (and can even mislead ruleset-specific handlers - see mania)
      continue;

    // osu-lazer-comment: At some point we probably want to rewind and play back the negative-time frames
    // but for now we'll achieve equal playback to stable by skipping negative frames

    if (diff < 0) continue;
    const actions: OsuAction[] = [];
    const b = parseInt(split[3]);

    if (bitmaskCheck(b, ReplayButtonState.Left1) || bitmaskCheck(b, ReplayButtonState.Left2))
      actions.push(OsuAction.leftButton);
    if (bitmaskCheck(b, ReplayButtonState.Right1) || bitmaskCheck(b, ReplayButtonState.Right2))
      actions.push(OsuAction.rightButton);

    frames.push({ actions, position: { x: mouseX, y: mouseY }, time: lastTime });
  }

  // We do the following merging because some frames have the same time, but the actions have to be merged together.

  const mergedFrames: ReplayFrame[] = [];
  let last;
  for (let i = 0; i < frames.length; i++) {
    if (last === undefined || frames[i].time !== last.time) {
      mergedFrames.push(frames[i]);
      last = frames[i];
    } else {
      for (let j = 0; j < frames[i].actions.length; j++) {
        const a = frames[i].actions[j];
        if (!last.actions.includes(a)) {
          last.actions.push(a);
        }
      }
      last.actions.sort();
    }
  }

  return mergedFrames;
};
