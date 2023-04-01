import { IconButton, Link, Typography } from "@mui/material";
import { FaDiscord } from "react-icons/fa";
import React from "react";
import { RewindLinks } from "../../utils/constants";
import { useCommonManagers } from "../../providers/TheaterProvider";

export function PromotionFooter() {
  const appVersion = useCommonManagers().appInfoService.version;
  return (
    <Typography fontSize={"caption.fontSize"} color={"text.secondary"}>
      Rewind {appVersion} by{" "}
      <Link href={RewindLinks.OsuPpyShAbstrakt} target={"_blank"} color={"text.secondary"}>
        abstrakt
      </Link>{" "}
      | osu! University
      <IconButton href={RewindLinks.OsuUniDiscord} target={"_blank"} size={"small"}>
        <FaDiscord />
      </IconButton>
    </Typography>
  );
}
