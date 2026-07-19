import {
  Beatmap,
  GameState,
  HitSampleBankInfo,
  HitSampleInfo,
  HitSoundType,
  isSlider,
  legacySampleFileName,
  SampleControlPoint,
  SliderEdgeSample,
} from "@osujs/core";
import { HitSampleEvent } from "./AudioEngine";

// How to locate the file(s) for a decoded sample. `key` is also the buffer key used at play time. Beatmap and skin
// candidates can differ: a custom beatmap file falls back to a bank sample in the skin.
export interface SampleDescriptor {
  key: string;
  beatmapCandidates: string[];
  skinCandidates: string[];
}

export interface BuiltHitSoundSchedule {
  schedule: HitSampleEvent[];
  samples: SampleDescriptor[];
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function resolveVolume(sample: HitSampleBankInfo, controlPoint: SampleControlPoint): number {
  return clamp01((sample.volume || controlPoint.sampleVolume) / 100);
}

// The file names to try for a bank sample: the indexed name, then the index-less name as a fallback.
function bankCandidates(bank: string, name: string, index: number): string[] {
  const key = legacySampleFileName(bank, name, index);
  return index >= 2 ? [key, `${bank}-${name}`] : [key];
}

/**
 * Builds the list of hit sounds to play during a replay from the fully-simulated game state, together with the set of
 * samples that need to be loaded.
 *
 * Only objects/checkpoints that were actually hit produce a sound (misses are silent). Covered are hit circles, slider
 * heads/repeats/ends (each with its own edge hit sound and sample banks) and slider ticks. The sample bank
 * (normal/soft/drum), custom index, volume and custom file name are resolved from the per-object / per-node overrides
 * and, as a fallback, the sample control point (timing point) active at each sound's time.
 */
export function buildHitSoundSchedule(beatmap: Beatmap, state: GameState): BuiltHitSoundSchedule {
  const schedule: HitSampleEvent[] = [];
  const controlPointInfo = beatmap.controlPointInfo;
  const sampleMap = new Map<string, SampleDescriptor>();

  const bankKey = (bank: string, name: string, index: number): string => {
    const key = legacySampleFileName(bank, name, index);
    if (!sampleMap.has(key)) {
      const candidates = bankCandidates(bank, name, index);
      sampleMap.set(key, { key, beatmapCandidates: candidates, skinCandidates: candidates });
    }
    return key;
  };

  // When beatmap hit sounds are disabled, the skin's bank normal sample stands in for the custom file.
  const customKey = (filename: string, fallbackBank: string, fallbackIndex: number): string => {
    const key = `file:${filename}`;
    if (!sampleMap.has(key)) {
      sampleMap.set(key, {
        key,
        beatmapCandidates: [filename],
        skinCandidates: bankCandidates(fallbackBank, HitSampleInfo.HIT_NORMAL, fallbackIndex),
      });
    }
    return key;
  };

  const soundNames = (hitSound: number, sample: HitSampleBankInfo, controlPoint: SampleControlPoint): string[] => {
    const normalBank = sample.normalBank ?? controlPoint.sampleBank;
    const additionBank = sample.additionBank ?? controlPoint.sampleBank;
    const index = sample.index || controlPoint.sampleIndex;
    const names = [
      sample.filename
        ? customKey(sample.filename, normalBank, index)
        : bankKey(normalBank, HitSampleInfo.HIT_NORMAL, index),
    ];
    if (hitSound & HitSoundType.Whistle) names.push(bankKey(additionBank, HitSampleInfo.HIT_WHISTLE, index));
    if (hitSound & HitSoundType.Finish) names.push(bankKey(additionBank, HitSampleInfo.HIT_FINISH, index));
    if (hitSound & HitSoundType.Clap) names.push(bankKey(additionBank, HitSampleInfo.HIT_CLAP, index));
    return names;
  };

  const hitSoundEvent = (
    hitSound: number,
    sample: HitSampleBankInfo,
    playTime: number,
    sampleTime: number,
  ): HitSampleEvent => {
    const controlPoint = controlPointInfo.samplePointAt(sampleTime);
    return {
      time: playTime,
      names: soundNames(hitSound, sample, controlPoint),
      volume: resolveVolume(sample, controlPoint),
    };
  };

  // Hit circles and slider heads (both stored as hit circle verdicts).
  for (const id in state.hitCircleVerdict) {
    if (state.hitCircleVerdict[id].type === "MISS") continue;
    const hitCircle = beatmap.getHitCircle(id);
    if (!hitCircle) continue;
    const judgementTime = state.hitCircleVerdict[id].judgementTime;
    schedule.push(hitSoundEvent(hitCircle.hitSound, hitCircle.sample, judgementTime, hitCircle.hitTime));
  }

  // Slider ticks, repeats and the slider end (tail).
  for (const object of beatmap.hitObjects) {
    if (!isSlider(object)) continue;
    const tailEdge: SliderEdgeSample = object.edges[object.edges.length - 1] ?? {
      hitSound: object.head.hitSound,
      sample: object.head.sample,
    };
    for (const checkPoint of object.checkPoints) {
      if (!state.checkPointVerdict[checkPoint.id]?.hit) continue;
      switch (checkPoint.type) {
        case "TICK": {
          const controlPoint = controlPointInfo.samplePointAt(checkPoint.hitTime);
          const bank = object.head.sample.normalBank ?? controlPoint.sampleBank;
          const index = object.head.sample.index || controlPoint.sampleIndex;
          schedule.push({
            time: checkPoint.hitTime,
            names: [bankKey(bank, HitSampleInfo.SLIDER_TICK, index)],
            volume: resolveVolume(object.head.sample, controlPoint),
          });
          break;
        }
        case "REPEAT": {
          // Repeat for span k corresponds to node k + 1.
          const edge = object.edges[checkPoint.spanIndex + 1] ?? tailEdge;
          schedule.push(hitSoundEvent(edge.hitSound, edge.sample, checkPoint.hitTime, checkPoint.hitTime));
          break;
        }
        case "LAST_LEGACY_TICK":
          // The scoring "last tick" is offset from the visual end; play the tail sound at the real end time.
          schedule.push(hitSoundEvent(tailEdge.hitSound, tailEdge.sample, object.endTime, object.endTime));
          break;
      }
    }
  }

  return { schedule, samples: [...sampleMap.values()] };
}
