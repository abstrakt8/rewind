import { Box, darken, Slider, Stack, Tooltip } from "@mui/material";
import { formatGameTime } from "@rewind/osu/math";

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

export interface ReplayBarProps {
  backgroundEnable?: boolean;
}

export function ReplayBar(props: ReplayBarProps) {
  const { backgroundEnable } = props;
  const valueLabelFormat = (value: number) => {
    return formatGameTime(value);
  };

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <Stack
        sx={{
          overflow: "hidden",
          // borderRadius: 1,
          visibility: backgroundEnable ? "visible" : "hidden",
          filter: "brightness(50%)",
        }}
      >
        <EventLine color={"hsl(0,100%,50%)"} tooltip={"Misses"} positions={[0.3]} />
        <EventLine color={"hsl(21,100%,50%)"} tooltip={"Slider Breaks"} positions={[0.0, 0.5, 0.9]} />
        <EventLine color={"hsl(52,100%,50%)"} tooltip={"50s"} positions={[0.4, 0.6, 0.88]} />
        <EventLine color={"hsl(96,100%,50%)"} tooltip={"100s"} positions={[0.1, 0.2, 0.33, 0.34, 0.345, 0.6, 0.601]} />
      </Stack>
      <Slider
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
            transition: "0.3s bezier(.47,1.64,.41,.8)",
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
        defaultValue={0.4}
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        valueLabelDisplay={"auto"}
        max={727 * 1000}
      />
    </Box>
  );
}
