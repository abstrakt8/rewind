import { Box, Slider, styled } from "@mui/material";
import { formatGameTime, rgbToInt } from "@rewind/osu/math";
import { ignoreFocus } from "../utils/IgnoreFocus";
import { useEffect, useRef } from "react";
import { Renderer, Sprite, Texture } from "pixi.js";
import { AdjustmentFilter } from "@pixi/filter-adjustment";
import { Container } from "@pixi/display";
import colorString from "color-string";

interface EventLineProps {
  color: string;
  tooltip: string;
  positions: number[];
}

type EventType = { timings: number[]; tooltip: string; color: string };

export interface BaseGameTimeSliderProps {
  backgroundEnable?: boolean;
  // Duration in ms
  duration: number;
  // Time in ms
  currentTime: number;
  // When the slider is dragged
  onChange: (value: number) => any;

  events: EventType[];
}

function drawPlaybarEvents(canvas: HTMLCanvasElement, eventTypes: EventType[], duration: number) {
  const renderer = new Renderer({ view: canvas, backgroundAlpha: 0.0 });
  const stage = new Container();
  const { height, width } = renderer.screen;
  const eventLineHeight = height / eventTypes.length;
  for (let i = 0; i < eventTypes.length; i++) {
    const eventType = eventTypes[i];
    const container = new Container();
    const descriptor = colorString.get(eventType.color);
    if (!descriptor) break;
    const tint = rgbToInt(descriptor.value);
    // console.log(`Event ${i} has color ${tint} and ${descriptor.value}`);
    for (const timing of eventType.timings) {
      const sprite = Sprite.from(Texture.WHITE);
      sprite.tint = tint;
      // TODO: This needs to be centered -> but doesn't really matter since it's kinda negligible
      sprite.width = 1;
      sprite.height = eventLineHeight;
      sprite.position.set((timing / duration) * width, 0);
      container.addChild(sprite);
    }
    stage.addChild(container);
    container.position.set(0, i * eventLineHeight);
  }
  stage.filters = [new AdjustmentFilter({ brightness: 0.7 })];

  stage.interactive = false;
  stage.interactiveChildren = false;
  renderer.render(stage);
  // Doesn't need ticker right?
}

const Canvas = styled("canvas")`
  //background: aqua;
  position: absolute;
  height: 40px;
  width: 100%;
  top: 0;
  left: 0;
  transform: translate(0, -50%);
`;

export function BaseGameTimeSlider(props: BaseGameTimeSliderProps) {
  const { backgroundEnable, duration, currentTime, onChange, events } = props;
  const valueLabelFormat = (value: number) => formatGameTime(value);

  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    drawPlaybarEvents(canvasRef.current, events, duration);
  }, [canvasRef, events, duration]);

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <Canvas ref={canvasRef} />
      <Slider
        onFocus={ignoreFocus}
        size={"small"}
        // The padding here determines how clickable the slider is
        // This is copied from: https://mui.com/components/slider/#music-player
        sx={{
          position: "absolute",
          top: "50%",
          transform: "translate(0, -50%)",
          padding: "2px 0",

          color: "white",
          height: 6,
          "& .MuiSlider-thumb": {
            width: 8,
            height: 8,
            // transition: "0.3s bezier(.47,1.64,.41,.8)",
            transition: "none",
            "&:before": {
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
            },
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0px 0px 0px 8px ${"rgb(255 255 255 / 16%)"}`,
            },
            "&.Mui-active": {
              width: 12,
              height: 12,
            },
          },
          "& .MuiSlider-rail": {
            opacity: 0.28,
          },
          "& .MuiSlider-track": {
            transition: "none", // Otherwise it lags behind on very short songs
          },
        }}
        value={currentTime}
        onChange={(_, x) => onChange(x as number)}
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        valueLabelDisplay={"auto"}
        step={16}
        max={duration}
      />
    </Box>
  );
}
