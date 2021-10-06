import { Container } from "pixi.js";
import { injectable } from "inversify";
import { HitCircle, isHitCircle, isSlider, Slider, Spinner } from "@rewind/osu/core";
import { HitCircleFactory } from "./HitCircleFactory";
import { SliderFactory } from "./SliderFactory";
import { SpinnerFactory } from "./SpinnerFactory";
import { BeatmapManager } from "../../../apps/analysis/manager/BeatmapManager";

export class HitObjectsContainer {
  approachCircleContainer: Container;
  spinnerProxies: Container;
  hitObjectContainer: Container;

  constructor(
    private readonly beatmapManager: BeatmapManager,
    private readonly hitCircleFactory: HitCircleFactory,
    private readonly sliderFactory: SliderFactory,
    private readonly spinnerFactory: SpinnerFactory,
  ) {
    this.approachCircleContainer = new Container();
    this.hitObjectContainer = new Container();
    this.spinnerProxies = new Container();
  }

  private createHitCircle(hitCircle: HitCircle) {
    const { hitCircleArea, approachCircle } = this.hitCircleFactory.createHitCircle(hitCircle) ?? {};
    if (hitCircleArea) this.hitObjectContainer.addChild(hitCircleArea);
    if (approachCircle) this.approachCircleContainer.addChild(approachCircle);
  }

  private createSlider(slider: Slider) {
    const body = this.sliderFactory.create(slider);
    if (body) this.hitObjectContainer.addChild(body);
    this.createHitCircle(slider.head);
  }

  private createSpinner(spinner: Spinner) {
    const spinnerGraphic = this.spinnerFactory.create(spinner);
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
        this.createHitCircle(hitObject);
      } else if (isSlider(hitObject)) {
        this.createSlider(hitObject);
      } else {
        this.createSpinner(hitObject);
      }
    }

    this.sliderFactory.postUpdate();
  }
}

@injectable()
export class HitObjectsContainerFactory {
  constructor(
    private readonly beatmapManager: BeatmapManager,
    private readonly hitCirclePreparer: HitCircleFactory,
    private readonly sliderPreparer: SliderFactory,
    private readonly spinnerPreparer: SpinnerFactory,
  ) {}

  createHitObjectsContainer() {
    return new HitObjectsContainer(
      this.beatmapManager,
      this.hitCirclePreparer,
      this.sliderPreparer,
      this.spinnerPreparer,
    );
  }
}
