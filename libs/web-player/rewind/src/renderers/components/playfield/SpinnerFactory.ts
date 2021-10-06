import { injectable } from "inversify";
import { Spinner } from "@rewind/osu/core";
import { GameplayClock } from "../../../core/game/GameplayClock";
import { SkinHolder } from "../../../core/skins/SkinHolder";
import { OsuClassicSpinner } from "@rewind/osu-pixi/classic-components";
import { GameSimulator } from "../../../core/game/GameSimulator";
import { ModSettingsManager } from "../../../apps/analysis/manager/ModSettingsManager";

// TODO: Maybe it's even dynamic
const SPINNER_FADE_OUT_DURATION = 300;

@injectable()
export class SpinnerFactory {
  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly modSettingsManager: ModSettingsManager,
    private readonly stageSkinService: SkinHolder,
  ) {}

  create(spinner: Spinner) {
    const skin = this.stageSkinService.getSkin();
    const time = this.gameClock.timeElapsedInMs;
    const { hidden } = this.modSettingsManager.modSettings;

    if (spinner.startTime <= time && time <= spinner.endTime + SPINNER_FADE_OUT_DURATION) {
      const gSpinner = new OsuClassicSpinner();
      gSpinner.prepare({
        approachCircleTexture: skin.getTexture("SPINNER_APPROACH_CIRCLE"),
        duration: spinner.duration,
        time: time - spinner.endTime,
        modHidden: hidden,
      });

      return gSpinner;
    }
    return undefined;
  }
}
