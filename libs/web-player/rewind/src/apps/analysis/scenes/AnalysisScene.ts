import { UserScene } from "../../../core/scenes/IScene";
import { injectable } from "inversify";
import { AnalysisStage } from "../../../renderers/components/stage/AnalysisStage";
import { GameplayClock } from "../../../core/game/GameplayClock";
import { GameSimulator } from "../../../core/game/GameSimulator";

// Just the normal analysis scene that updates according to a virtual game clock.
@injectable()
export class AnalysisScene implements UserScene {
  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly analysisStage: AnalysisStage,
  ) {}

  update() {
    this.gameClock.tick();
    this.gameSimulator.simulate(this.gameClock.timeElapsedInMs);
    this.analysisStage.updateAnalysisStage();
  }

  get stage() {
    return this.analysisStage.stage;
  }

  destroy(): void {
    this.analysisStage.destroy();
  }

  init(data: unknown): void {
    // Do nothing
  }

  preload(): Promise<void> {
    return Promise.resolve(undefined);
  }

  create(): void {
    // Do nothing
  }
}
