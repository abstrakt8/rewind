import { Container, Graphics } from "pixi.js";
import { inject, injectable } from "inversify";
import { TemporaryObjectPool } from "../../../../../pixi/pooling/TemporaryObjectPool";
import { Beatmap, HitCircle, isHitCircle } from "@rewind/osu/core";
import { TYPES } from "../../../types";
import { settingsApproachCircle } from "../../../../../pixi/HitObjectPreparer";
import { GameplayClock } from "../../../core/GameplayClock";
import { StageViewService } from "../../StageViewService";
import { StageSkinService } from "../../../StageSkinService";
import { Skin } from "../../../../../skins/Skin";
import {
  HitResult,
  OsuClassicApproachCircle,
  OsuClassicHitCircleArea,
  OsuClassicHitCircleAreaSettings,
} from "@rewind/osu-pixi/classic-components";
import { SkinTextures } from "@rewind/osu/skin";

@injectable()
export class HitObjectsPreparer {
  approachCircleContainer: Container;
  spinnerProxies: Container;
  hitObjectContainer: Container;
  graphicsPool: TemporaryObjectPool<Graphics>;

  constructor(
    @inject(TYPES.BEATMAP) private readonly beatmap: Beatmap,
    private readonly gameClock: GameplayClock,
    private readonly stageViewService: StageViewService,
    private readonly stageSkinService: StageSkinService,
  ) {
    this.approachCircleContainer = new Container();
    this.hitObjectContainer = new Container();
    this.spinnerProxies = new Container();
    // this.sliderTextureManager = new SliderTextureManager(new BasicSliderTextureRenderer(renderer));
    this.graphicsPool = new TemporaryObjectPool<Graphics>(
      () => new Graphics(),
      (g) => g.clear(),
      { initialSize: 10 },
    );
  }

  // TODO: Pooling
  private getOsuClassicHitCircleArea(id: string) {
    return new OsuClassicHitCircleArea();
  }

  private getOsuClassicApproachCircle(id: string) {
    return new OsuClassicApproachCircle({});
  }

  private prepareHitCircle(hitCircle: HitCircle) {
    const time = this.gameClock.timeElapsedInMs;
    const view = this.stageViewService.getView();
    const skin = this.stageSkinService.getSkin();

    const { modHidden } = view;

    // TODO: Cleanup pfusch
    if (time < hitCircle.spawnTime || hitCircle.hitTime + 300 < time) return;

    console.log(`Preparing at time=${this.gameClock.timeElapsedInMs}`);

    //
    {
      const area = this.getOsuClassicHitCircleArea(hitCircle.id);
      const hitCircleState = { type: "GREAT", judgementTime: hitCircle.hitTime };
      // TODO:
      // scene.gameplayState?.hitCircleVerdict[hitCircle.id];
      const hitResult = hitCircleState
        ? {
            hit: hitCircleState.type !== "MISS",
            timing: hitCircleState.judgementTime - hitCircle.hitTime,
          }
        : null;
      area.prepare(settingsHitCircleArea({ hitCircle, gameTime: time, modHidden, skin, hitResult }));
      this.hitObjectContainer.addChild(area.container);
    }
    {
      const approachCircle = this.getOsuClassicApproachCircle(hitCircle.id);
      approachCircle.prepare(settingsApproachCircle({ hitCircle, skin, gameTime: time, modHidden }));
      this.approachCircleContainer.addChild(approachCircle.sprite);
    }
  }

  prepare() {
    this.hitObjectContainer.removeChildren();
    this.spinnerProxies.removeChildren();
    this.approachCircleContainer.removeChildren();

    const { hitObjects } = this.beatmap;

    // TODO: This assumes that they are ordered by some time
    for (let i = hitObjects.length - 1; i >= 0; i--) {
      const hitObject = hitObjects[i];
      if (isHitCircle(hitObject)) this.prepareHitCircle(hitObject);
      // if (isSlider(hitObject)) this.prepareSlider(scene, hitObject);
      // if (isSpinner(hitObject)) this.prepareSpinner(scene, hitObject);
    }
  }
}

function settingsHitCircleArea(s: {
  hitCircle: HitCircle;
  skin: Skin;
  gameTime: number;
  modHidden?: boolean;
  hitResult: HitResult | null;
}): Partial<OsuClassicHitCircleAreaSettings> {
  const { gameTime, hitCircle, skin, modHidden, hitResult } = s;
  return {
    time: gameTime - hitCircle.hitTime,
    numberTextures: skin.getHitCircleNumberTextures(),
    numberOverlap: skin.config.fonts.hitCircleOverlap,
    hitCircleOverlayAboveNumber: skin.config.general.hitCircleOverlayAboveNumber,

    hitCircleTexture: skin.getTexture(SkinTextures.HIT_CIRCLE),
    hitCircleOverlayTexture: skin.getTexture(SkinTextures.HIT_CIRCLE_OVERLAY),

    tint: skin.getComboColorForIndex(hitCircle.comboSetIndex),

    number: hitCircle.withinComboSetIndex + 1,
    approachDuration: hitCircle.approachDuration,

    modHidden,
    scale: hitCircle.scale,
    position: hitCircle.position,
    hitResult,
    // fadeInDuration, numberScaling
  };
}
