import { IconButton, Link, Typography } from "@mui/material";
import { FaDiscord } from "react-icons/all";
import React from "react";
import { RewindLinks } from "../utils/Constants";

export function PromotionFooter() {
  return (
    <Typography fontSize={"caption.fontSize"} color={"text.secondary"}>
      {/*TODO: Version dynamic*/}
      Rewind v0.0.2 by{" "}
      <Link href={RewindLinks.abstraktOsu} target={"_blank"} color={"text.secondary"}>
        abstrakt
      </Link>{" "}
      | osu! University
      <IconButton href={RewindLinks.OsuUniDiscord} target={"_blank"} size={"small"}>
        <FaDiscord />
      </IconButton>
    </Typography>
  );
}
