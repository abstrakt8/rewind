import { Box, darken, Slider, Stack, Tooltip } from "@mui/material";
import { formatGameTime } from "@rewind/osu/math";
import { ignoreFocus } from "../utils/IgnoreFocus";
import { useMemo } from "react";

interface EventLineProps {
  color: string;
  tooltip: string;
  positions: number[];
}

const EventLine = ({ color, tooltip, positions }: EventLineProps) => {
  return (
    <Tooltip title={tooltip} placement={"right"}>
      <div>
        <Box
          sx={{
            height: "12px",
            // backgroundColor: darken(color, 0.9),
            "&:hover": {
              backgroundColor: darken(color, 0.4),
            },
            position: "relative",
          }}
        >
          {positions.map((p, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                transform: "translate(-50%)",
                backgroundColor: color,

                // TODO: Introduce this only if it's actually possible to go there, otherwise might confuse
                // backgroundColor: darken(color, 0.2),
                // "&:hover": {
                //   backgroundColor: color,
                // },
                width: "2px",
                height: "100%",

                left: `${p * 100}%`,
              }}
            />
          ))}
        </Box>
      </div>
    </Tooltip>
  );
};

export interface BaseGameTimeSliderProps {
  backgroundEnable?: boolean;
  // Duration in ms
  duration: number;
  // Time in ms
  currentTime: number;
  // When the slider is dragged
  onChange: (value: number) => any;

  events: { timings: number[]; tooltip: string; color: string }[];
}

export function BaseGameTimeSlider(props: BaseGameTimeSliderProps) {
  const { backgroundEnable, duration, currentTime, onChange, events } = props;
  const valueLabelFormat = (value: number) => formatGameTime(value);

  const eventLines = useMemo(() => {
    return events.map((e) => (
      <EventLine
        key={e.tooltip + e.color}
        color={e.color}
        tooltip={e.tooltip}
        positions={e.timings.map((t) => t / duration)}
      />
    ));
  }, [events, duration]);

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/*TODO: Optimize with canvas*/}
      <Stack
        sx={{
          overflow: "hidden",
          // borderRadius: 1,
          visibility: backgroundEnable ? "visible" : "hidden",
          filter: "brightness(50%)",
        }}
      >
        {eventLines}
      </Stack>
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
