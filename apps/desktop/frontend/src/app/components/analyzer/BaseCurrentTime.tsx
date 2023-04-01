import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useRef } from "react";
import { formatGameTime } from "@osujs/math";
import { darken, Typography } from "@mui/material";

export type GameCurrentTimeProps = Record<string, unknown>;

export interface GameCurrentTimeHandle {
  updateTime: (timeInMs: number) => void;
}

const ForwardCurrentTime: ForwardRefRenderFunction<GameCurrentTimeHandle, GameCurrentTimeProps> = (props, ref) => {
  const refMain = useRef<HTMLSpanElement>(null);
  const refMs = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    updateTime(timeInMs) {
      const [timeHMS, timeMS] = formatGameTime(timeInMs, true).split(".");
      if (refMain.current) refMain.current.textContent = timeHMS;
      if (refMs.current) refMs.current.textContent = "." + timeMS;
    },
  }));
  return (
    <Typography component={"span"} sx={{ userSelect: "all" }}>
      <span ref={refMain}>0:00</span>

      <Typography component={"span"} sx={{ color: (theme) => darken(theme.palette.text.primary, 0.6) }} ref={refMs}>
        <span ref={refMs}>.000</span>
      </Typography>
    </Typography>
  );
};

export const BaseCurrentTime = forwardRef(ForwardCurrentTime);
