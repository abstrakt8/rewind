import { Container } from "pixi.js";
import { injectable } from "inversify";
import { HitCircle, isHitCircle, isSlider, Slider, Spinner } from "@rewind/osu/core";
import { HitCirclePreparer } from "./HitCirclePreparer";
import { SliderPreparer } from "./SliderPreparer";
import { SpinnerPreparer } from "./SpinnerPreparer";
import { BeatmapManager } from "../../../apps/analysis/manager/BeatmapManager";

@injectable()
export class HitObjectsPreparer {
  approachCircleContainer: Container;
  spinnerProxies: Container;
  hitObjectContainer: Container;

  constructor(
    private readonly beatmapManager: BeatmapManager,
    private readonly hitCirclePreparer: HitCirclePreparer,
    private readonly sliderPreparer: SliderPreparer,
    private readonly spinnerPreparer: SpinnerPreparer,
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

  private prepareSpinner(spinner: Spinner) {
    const spinnerGraphic = this.spinnerPreparer.prepare(spinner);
    if (spinnerGraphic) this.spinnerProxies.addChild(spinnerGraphic.container);
  }

  update() {
    this.hitObjectContainer.removeChildren();
    this.spinnerProxies.removeChildren();
    this.approachCircleContainer.removeChildren();

    const { hitObjects } = this.beatmapManager.getBeatmap();

    // TODO: This assumes that they are ordered by some time
    for (let i = hitObjects.length - 1; i >= 0; i--) {
      const hitObject = hitObjects[i];
      if (isHitCircle(hitObject)) {
        this.prepareHitCircle(hitObject);
      } else if (isSlider(hitObject)) {
        this.prepareSlider(hitObject);
      } else {
        this.prepareSpinner(hitObject);
      }
    }

    this.sliderPreparer.postUpdate();
  }
}
