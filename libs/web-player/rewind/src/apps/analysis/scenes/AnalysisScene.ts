import { UserScene } from "../../../core/scenes/IScene";
import { injectable } from "inversify";
import { AnalysisStagePreparer } from "../../../renderers/components/stage/AnalysisStagePreparer";
import { GameplayClock } from "../../../core/game/GameplayClock";
import { GameSimulator } from "../../../core/game/GameSimulator";

// Just the normal analysis scene that updates according to a virtual game clock.
@injectable()
export class AnalysisScene implements UserScene {
  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly analysisStagePreparer: AnalysisStagePreparer,
  ) {}

  get stage() {
    return this.analysisStagePreparer.stage;
  }

  update() {
    this.gameClock.tick();
    this.gameSimulator.simulate(this.gameClock.timeElapsedInMs);
    this.analysisStagePreparer.update();
  }

  create(): void {
    // Do nothing
  }

  destroy(): void {
    // Do nothing
  }

  init(data: unknown): void {
    // Do nothing
  }

  preload(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
