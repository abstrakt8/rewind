import { Skin } from "../skins/Skin";
import { SliderBodySettings } from "osu-canvas";
import { Slider } from "osu-lib";
import { RGB } from "osu-math";

export function sliderBodySetting(s: {
  skin: Skin;
  modHidden?: boolean;
  slider: Slider;
  gameTime: number;
}): Partial<SliderBodySettings> {
  const { skin, modHidden, slider, gameTime } = s;

  return {
    modHidden,
    duration: slider.duration,
    position: slider.head.position,
    approachDuration: slider.head.approachDuration,
    radius: slider.radius,
    borderColor: skin.config.colors.sliderBorder as RGB,
    time: gameTime - slider.startTime,
    snakingIn: false,
    snakingOut: false,
    points: slider.path.calculatedPath,
  };
}
