import React from "react";
import { formatGameTime } from "@rewind/osu/math";
import { darken, Typography } from "@mui/material";

export interface GameCurrentTimeProps {
  currentTime: number;
}

export const BaseCurrentTime = (props: GameCurrentTimeProps) => {
  const { currentTime } = props;
  const [timeHMS, timeMS] = formatGameTime(currentTime, true).split(".");

  return (
    <Typography component={"span"} sx={{ userSelect: "all" }}>
      {timeHMS}
      <Typography component={"span"} sx={{ color: (theme) => darken(theme.palette.text.primary, 0.6) }}>
        .{timeMS}
      </Typography>
    </Typography>
  );
};
