import { Box, darken, Stack, Tooltip } from "@mui/material";

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
            height: "0.5em",
            backgroundColor: darken(color, 0.6),
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
                backgroundColor: darken(color, 0.2),
                "&:hover": {
                  backgroundColor: color,
                },
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

export interface ReplayBarProps {}

export function ReplayBar(props: ReplayBarProps) {
  return (
    <Stack sx={{ overflow: "hidden" }}>
      <EventLine color={"hsl(0,100%,50%)"} tooltip={"Misses"} positions={[0.3]} />
      <EventLine color={"hsl(21,100%,50%)"} tooltip={"Slider Breaks"} positions={[0.0, 0.5, 0.9]} />
      <EventLine color={"hsl(52,100%,50%)"} tooltip={"50s"} positions={[0.4, 0.6, 0.88]} />
      <EventLine color={"hsl(96,100%,50%)"} tooltip={"100s"} positions={[0.1, 0.2, 0.33, 0.34, 0.345, 0.6, 0.601]} />
    </Stack>
  );
}
