import { injectable } from "inversify";
import { HitCircle } from "@osujs/core";
import { GameplayClock } from "../../../common/game/GameplayClock";
import {
  HitResult,
  OsuClassicApproachCircle,
  OsuClassicApproachCircleSettings,
  OsuClassicHitCircleArea,
  OsuClassicHitCircleAreaSettings,
} from "@rewind/osu-pixi/classic-components";
import type { ISkin } from "../../../../model/Skin";
import { GameSimulator } from "../../../common/game/GameSimulator";
import { TemporaryObjectPool } from "../../../../utils/pooling/TemporaryObjectPool";
import { ModSettingsService } from "../../../analysis/mod-settings";
import { SkinHolder } from "../../../common/skin";

// TODO: Maybe it's even dynamic
const HIT_CIRCLE_FADE_OUT_DURATION = 300;

/**
 * Connected to all the different components and knows how to create the corresponding hit circle components (area +
 * approach circle).
 */
@injectable()
export class HitCircleFactory {
  hitAreaPool: TemporaryObjectPool<OsuClassicHitCircleArea>;

  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly modSettingsService: ModSettingsService,
    private readonly stageSkinService: SkinHolder,
  ) {
    this.hitAreaPool = new TemporaryObjectPool<OsuClassicHitCircleArea>(
      () => new OsuClassicHitCircleArea(),
      (t) => {},
      { initialSize: 50 },
    );
  }

  // TODO: Pooling
  private getOsuClassicHitCircleArea(id: string) {
    return new OsuClassicHitCircleArea();
  }

  private getOsuClassicApproachCircle(id: string) {
    return new OsuClassicApproachCircle({});
  }

  freeResources() {
    this.hitAreaPool.releaseUntouched();
  }

  createHitCircle(hitCircle: HitCircle) {
    const time = this.gameClock.timeElapsedInMs;
    const modSettings = this.modSettingsService.modSettings;
    const skin = this.stageSkinService.getSkin();

    const modHidden = modSettings.hidden;

    const isVisible = hitCircle.spawnTime <= time && time <= hitCircle.hitTime + HIT_CIRCLE_FADE_OUT_DURATION;

    if (!isVisible) return undefined;

    const gameplayState = this.gameSimulator.getCurrentState();

    const area = this.getOsuClassicHitCircleArea(hitCircle.id);
    // const [area] = this.hitAreaPool.allocate(hitCircle.id);
    // TODO: Replace this with a service that can also be mocked and simulate AUTO play
    const hitCircleState = gameplayState?.hitCircleVerdict[hitCircle.id];

    const hitResult = hitCircleState
      ? {
          hit: hitCircleState.type !== "MISS",
          timing: hitCircleState.judgementTime - hitCircle.hitTime,
        }
      : null;
    area.prepare(createHitCircleAreaSettings({ hitCircle, gameTime: time, modHidden, skin, hitResult }));

    const approachCircle = this.getOsuClassicApproachCircle(hitCircle.id);
    approachCircle.prepare(createApproachCircleSettings({ hitCircle, skin, gameTime: time, modHidden }));

    return {
      hitCircleArea: area.container,
      approachCircle: approachCircle.sprite,
    };
  }
}

export function createApproachCircleSettings(s: {
  hitCircle: HitCircle;
  skin: ISkin;
  gameTime: number;
  modHidden?: boolean;
}): Partial<OsuClassicApproachCircleSettings> {
  const { hitCircle, skin, gameTime, modHidden } = s;
  return {
    time: gameTime - hitCircle.hitTime,
    texture: skin.getTexture("APPROACH_CIRCLE"),
    approachDuration: hitCircle.approachDuration,
    scale: hitCircle.scale,
    position: hitCircle.position,
    tint: skin.getComboColorForIndex(hitCircle.comboSetIndex),
    modHidden: modHidden,
    // fadeInDuration, numberScaling
  };
}

function createHitCircleAreaSettings(s: {
  hitCircle: HitCircle;
  skin: ISkin;
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

    hitCircleTexture: skin.getTexture("HIT_CIRCLE"),
    hitCircleOverlayTexture: skin.getTexture("HIT_CIRCLE_OVERLAY"),

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
