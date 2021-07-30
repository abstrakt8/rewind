import { OsuClassicHitCircleAreaSettings } from "@rewind/osu-pixi/classic-components";
import { HitCircle } from "@rewind/osu/core";
import { Skin } from "../skins/Skin";
import { SkinTextures } from "@rewind/osu/skin";
import { OsuClassicApproachCircleSettings } from "@rewind/osu-pixi/classic-components";
import { HitResult } from "@rewind/osu-pixi/classic-components";

export function settingsHitCircleArea(s: {
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

export function settingsApproachCircle(s: {
  hitCircle: HitCircle;
  skin: Skin;
  gameTime: number;
  modHidden?: boolean;
}): Partial<OsuClassicApproachCircleSettings> {
  const { hitCircle, skin, gameTime, modHidden } = s;
  return {
    time: gameTime - hitCircle.hitTime,
    texture: skin.getTexture(SkinTextures.APPROACH_CIRCLE),
    approachDuration: hitCircle.approachDuration,
    scale: hitCircle.scale,
    position: hitCircle.position,
    tint: skin.getComboColorForIndex(hitCircle.comboSetIndex),
    modHidden: modHidden,
    // fadeInDuration, numberScaling
  };
}
