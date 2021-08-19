import { Container, Graphics } from "pixi.js";
import { inject, injectable } from "inversify";
import { Beatmap, HitCircle, isHitCircle, isSlider, Slider } from "@rewind/osu/core";
import { TYPES } from "../../../types";
import { GameplayClock } from "../../../core/GameplayClock";
import { StageViewService } from "../../StageViewService";
import { StageSkinService } from "../../../StageSkinService";
import { HitCirclePreparer } from "./HitCirclePreparer";
import { SliderPreparer } from "./SliderPreparer";

@injectable()
export class HitObjectsPreparer {
  approachCircleContainer: Container;
  spinnerProxies: Container;
  hitObjectContainer: Container;

  constructor(
    @inject(TYPES.BEATMAP) private readonly beatmap: Beatmap,
    private readonly gameClock: GameplayClock,
    private readonly stageViewService: StageViewService,
    private readonly stageSkinService: StageSkinService,
    private readonly hitCirclePreparer: HitCirclePreparer,
    private readonly sliderPreparer: SliderPreparer,
  ) {
    this.approachCircleContainer = new Container();
    this.hitObjectContainer = new Container();
    this.spinnerProxies = new Container();
  }

  private prepareHitCircle(hitCircle: HitCircle) {
    const { hitCircleArea, approachCircle } = this.hitCirclePreparer.prepare(hitCircle) ?? {};
    if (hitCircleArea) this.hitObjectContainer.addChild(hitCircleArea);
    if (approachCircle) this.approachCircleContainer.addChild(approachCircle);
  }

  private prepareSlider(slider: Slider) {
    const body = this.sliderPreparer.prepare(slider);
    if (body) this.hitObjectContainer.addChild(body);
    this.prepareHitCircle(slider.head);
  }

  prepare() {
    this.hitObjectContainer.removeChildren();
    this.spinnerProxies.removeChildren();
    this.approachCircleContainer.removeChildren();

    const { hitObjects } = this.beatmap;

    // TODO: This assumes that they are ordered by some time
    for (let i = hitObjects.length - 1; i >= 0; i--) {
      const hitObject = hitObjects[i];
      if (isHitCircle(hitObject)) {
        this.prepareHitCircle(hitObject);
      } else if (isSlider(hitObject)) {
        this.prepareSlider(hitObject);
      }
      // if (isSpinner(hitObject)) this.prepareSpinner(scene, hitObject);
    }

    this.sliderPreparer.afterPrepare();
  }
}
