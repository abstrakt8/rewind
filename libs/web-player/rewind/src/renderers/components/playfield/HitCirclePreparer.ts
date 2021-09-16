import { injectable } from "inversify";
import { HitCircle } from "@rewind/osu/core";
import { GameplayClock } from "../../../game/GameplayClock";
import { StageViewSettingsService } from "../../../settings/StageViewSettingsService";
import { StageSkinService } from "../../../StageSkinService";
import {
  HitResult,
  OsuClassicApproachCircle,
  OsuClassicApproachCircleSettings,
  OsuClassicHitCircleArea,
  OsuClassicHitCircleAreaSettings,
} from "@rewind/osu-pixi/classic-components";
import { Skin } from "../../../model/Skin";
import { GameSimulator } from "../../../game/GameSimulator";

// TODO: Maybe it's even dynamic
const HIT_CIRCLE_FADE_OUT_DURATION = 300;

@injectable()
export class HitCirclePreparer {
  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly stageViewService: StageViewSettingsService,
    private readonly stageSkinService: StageSkinService,
  ) {}

  // TODO: Pooling
  private getOsuClassicHitCircleArea(id: string) {
    return new OsuClassicHitCircleArea();
  }

  private getOsuClassicApproachCircle(id: string) {
    return new OsuClassicApproachCircle({});
  }

  prepare(hitCircle: HitCircle) {
    const time = this.gameClock.timeElapsedInMs;
    const view = this.stageViewService.getView();
    const skin = this.stageSkinService.getSkin();

    const { modHidden } = view;

    const isVisible = hitCircle.spawnTime <= time && time <= hitCircle.hitTime + HIT_CIRCLE_FADE_OUT_DURATION;

    if (!isVisible) return undefined;

    const gameplayState = this.gameSimulator.getCurrentState();

    const area = this.getOsuClassicHitCircleArea(hitCircle.id);
    const hitCircleState = gameplayState?.hitCircleVerdict[hitCircle.id];

    const hitResult = hitCircleState
      ? {
          hit: hitCircleState.type !== "MISS",
          timing: hitCircleState.judgementTime - hitCircle.hitTime,
        }
      : null;
    area.prepare(settingsHitCircleArea({ hitCircle, gameTime: time, modHidden, skin, hitResult }));

    const approachCircle = this.getOsuClassicApproachCircle(hitCircle.id);
    approachCircle.prepare(settingsApproachCircle({ hitCircle, skin, gameTime: time, modHidden }));

    return {
      hitCircleArea: area.container,
      approachCircle: approachCircle.sprite,
    };
  }
}

export function settingsApproachCircle(s: {
  hitCircle: HitCircle;
  skin: Skin;
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
