import React from "react";
import { formatGameTime } from "@rewind/osu/math";
import { darken, Typography } from "@mui/material";

export interface GameCurrentTimeProps {
  currentTimeInMs: number;
}

export const GameCurrentTime = (props: GameCurrentTimeProps) => {
  const { currentTimeInMs } = props;
  const [timeHMS, timeMS] = formatGameTime(currentTimeInMs, true).split(".");

  return (
    <Typography component={"span"} sx={{ userSelect: "all" }}>
      {timeHMS}
      <Typography component={"span"} sx={{ color: (theme) => darken(theme.palette.text.primary, 0.6) }}>
        .{timeMS}
      </Typography>
    </Typography>
  );
};
