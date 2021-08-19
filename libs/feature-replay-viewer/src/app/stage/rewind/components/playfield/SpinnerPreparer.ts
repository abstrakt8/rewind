import { injectable } from "inversify";
import { Spinner } from "@rewind/osu/core";
import { GameplayClock } from "../../../core/GameplayClock";
import { StageViewService } from "../../StageViewService";
import { StageSkinService } from "../../../StageSkinService";
import { OsuClassicSpinner } from "@rewind/osu-pixi/classic-components";
import { SkinTextures } from "@rewind/osu/skin";
import { GameSimulator } from "../../GameSimulator";

// TODO: Maybe it's even dynamic
const SPINNER_FADE_OUT_DURATION = 300;

@injectable()
export class SpinnerPreparer {
  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly stageViewService: StageViewService,
    private readonly stageSkinService: StageSkinService,
  ) {}

  prepare(spinner: Spinner) {
    const skin = this.stageSkinService.getSkin();
    const time = this.gameClock.timeElapsedInMs;
    const view = this.stageViewService.getView();

    if (spinner.startTime <= time && time <= spinner.endTime + SPINNER_FADE_OUT_DURATION) {
      const gSpinner = new OsuClassicSpinner();
      gSpinner.prepare({
        approachCircleTexture: skin.getTexture(SkinTextures.SPINNER_APPROACH_CIRCLE),
        duration: spinner.duration,
        time: time - spinner.endTime,
        modHidden: view.modHidden,
      });

      return gSpinner;
    }
    return undefined;
  }
}
