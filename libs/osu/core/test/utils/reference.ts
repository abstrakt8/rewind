import { readFile } from "fs/promises";
import { createTestTimeMachine } from "./others";
import { GameplayInfoEvaluator } from "@rewind/osu/core";
import { formatGameTime } from "@rewind/osu/math";

// These files have been generated and are used as a reference for the "correct" osu!stable behavior.

interface ReferenceStructure {
  beatmapMd5: string;
  frames: Array<{ time: number; counts: [number, number, number, number] }>;
  hitOffsets: Array<number>;
}

export async function readStableReferenceJson(path: string) {
  const data = await readFile(path, { encoding: "utf-8" });
  const ref = JSON.parse(data);
  return ref as ReferenceStructure;
}

/**
 * @returns result[i] = a[i] - b[i]
 */
function arrayDelta(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw Error("The lengths must match!");
  }
  return a.map((val, i) => val - b[i]);
}

function debugGameTime(timeInMs: number) {
  return `${formatGameTime(timeInMs, true)} (${timeInMs}ms)`;
}

function countsEqual(expected: number[], actual: number[], check: number[] = [0, 1, 2, 3]) {
  for (const i of check) {
    if (expected[i] !== actual[i]) {
      return false;
    }
  }
  return true;
}

interface Options {
  countsToCheck: number[];
}

const defaultOptions: Options = {
  countsToCheck: [0, 1, 2, 3],
};

export async function compareTimeMachineWithReference(
  blueprintFile: string,
  replayFile: string,
  referenceFile: string,
  { countsToCheck }: Options = defaultOptions,
) {
  const reference = await readStableReferenceJson(referenceFile);
  const { timeMachine, beatmap } = createTestTimeMachine(blueprintFile, replayFile);
  const gameplayEvaluator = new GameplayInfoEvaluator(beatmap, { scoringSystem: "ScoreV1" });

  const mismatches = [];
  for (let i = 1; i < reference.frames.length; i++) {
    const { time: timePrev, counts: countsPrev } = reference.frames[i - 1];
    const { time: timeCur, counts: countsCur } = reference.frames[i];

    const timeDelta = timeCur - timePrev;
    const expectedCountsDelta = arrayDelta(countsCur, countsPrev);

    const { verdictCounts: actualCountsPrev } = gameplayEvaluator.evaluateReplayState(
      timeMachine.gameStateAt(timePrev),
    );
    const { verdictCounts: actualCountsCur } = gameplayEvaluator.evaluateReplayState(timeMachine.gameStateAt(timeCur));
    const actualCountsDelta = arrayDelta(actualCountsCur, actualCountsPrev);

    if (!countsEqual(expectedCountsDelta, actualCountsDelta, countsToCheck)) {
      console.log(
        `Between ${debugGameTime(timePrev)} and ${debugGameTime(
          timeCur,
        )} there is a count delta mismatch!\nExpected: ${expectedCountsDelta}\nActual: ${actualCountsDelta}`,
      );
    }
  }
}
