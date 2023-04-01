import {
  Beatmap,
  BucketedGameStateTimeMachine,
  defaultGameplayInfo,
  GameplayInfo,
  GameplayInfoEvaluator,
  GameState,
  HitObjectJudgement,
  isHitObjectJudgement,
  ReplayAnalysisEvent,
  retrieveEvents,
} from "@osujs/core";
import { injectable } from "inversify";
import type { OsuReplay } from "../../../model/OsuReplay";
import { BehaviorSubject } from "rxjs";
import { parser, std_diff } from "ojsama";
import { Queue } from "typescript-collections";
import { max } from "simple-statistics";

@injectable()
export class GameSimulator {
  private gameplayTimeMachine?: BucketedGameStateTimeMachine;
  private gameplayEvaluator?: GameplayInfoEvaluator;
  private currentState?: GameState;
  private lastState?: GameState;
  private currentInfo: GameplayInfo = defaultGameplayInfo;
  public replayEvents$: BehaviorSubject<ReplayAnalysisEvent[]>;
  public difficulties$: BehaviorSubject<number[]>;
  public judgements: HitObjectJudgement[] = [];
  public hits: [number, number, boolean][] = [];

  constructor() {
    this.replayEvents$ = new BehaviorSubject<ReplayAnalysisEvent[]>([]);
    this.difficulties$ = new BehaviorSubject<number[]>([]);
  }

  calculateDifficulties(rawBeatmap: string, durationInMs: number, mods: number) {
    console.log(`Calculating difficulty for beatmap with duration=${durationInMs}ms and mods=${mods}`);
    const p = new parser();
    p.feed(rawBeatmap);
    const map = p.map;
    const d = new std_diff().calc({ map, mods });

    const TIME_STEP = 500;
    const q = new Queue<[number, number]>();
    let i = 0;
    let sum = 0;
    const res: number[] = [];

    // O(n + m)
    for (let t = 0; t < durationInMs; t += TIME_STEP) {
      while (i < map.objects.length) {
        const o = map.objects[i];
        if (t + TIME_STEP < o.time) {
          break;
        }
        const strainTotal = d.objects[i].strains[0] + d.objects[i].strains[1];
        q.enqueue([o.time, strainTotal]);
        sum += strainTotal;
        i++;
      }
      while (!q.isEmpty()) {
        const [time, totalStrain] = q.peek() as [number, number];
        if (time > t - TIME_STEP) {
          break;
        }
        sum -= totalStrain;
        q.dequeue();
      }
      res.push(q.isEmpty() ? 0 : sum / q.size());
    }
    if (res.length > 0) {
      // normalize
      const m = max(res);
      if (m > 0) {
        const normalizedRes = res.map((r) => r / m);
        this.difficulties$.next(normalizedRes);
      }
    }
  }

  calculateHitErrorArray() {}

  simulateReplay(beatmap: Beatmap, replay: OsuReplay) {
    this.gameplayTimeMachine = new BucketedGameStateTimeMachine(replay.frames, beatmap, {
      hitWindowStyle: "OSU_STABLE",
      noteLockStyle: "STABLE",
    });
    this.gameplayEvaluator = new GameplayInfoEvaluator(beatmap, {});
    // TODO: Move this to async ...
    this.lastState = this.gameplayTimeMachine.gameStateAt(1e9);
    this.currentInfo = defaultGameplayInfo;
    // this.currentState = finalState...
    this.replayEvents$.next(retrieveEvents(this.lastState, beatmap.hitObjects));
    this.judgements = this.replayEvents$.getValue().filter(isHitObjectJudgement);

    this.hits = [];
    if (!this.lastState) return;

    // In order
    for (const id of this.lastState.judgedObjects) {
      const h = beatmap.getHitObject(id);
      if (h.type === "HIT_CIRCLE") {
        const s = this.lastState.hitCircleVerdict[id];
        const hitCircle = beatmap.getHitCircle(id);
        const offset = s.judgementTime - hitCircle.hitTime;
        const hit = s.type !== "MISS";
        this.hits.push([s.judgementTime, offset, hit]);
      }
    }
    // not sure if this is needed
    this.hits.sort((a, b) => a[0] - b[0]);
  }

  // Simulates the game to be at the given time
  // If a whole game simulation has happened, then this should be really fast
  simulate(gameTimeInMs: number) {
    if (this.gameplayTimeMachine && this.gameplayEvaluator) {
      this.currentState = this.gameplayTimeMachine.gameStateAt(gameTimeInMs);
      this.currentInfo = this.gameplayEvaluator.evaluateReplayState(this.currentState!);
    }
  }

  getCurrentState() {
    return this.currentState;
  }

  getCurrentInfo() {
    return this.currentInfo;
  }

  // Very likely to be a request from the UI since it wants to render the playbar events
  async calculateEvents() {
    // In case it takes unbearably long -> we might need a web worker
  }

  clear() {
    this.replayEvents$.next([]);
    this.difficulties$.next([]);
  }
}
