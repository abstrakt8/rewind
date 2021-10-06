import { FaDiscord, FaTwitter, FaYoutube } from "react-icons/fa";
import { discordUrl, twitterUrl, youtubeUrl } from "../../constants";
import { IconButton, Link, Stack, Typography } from "@mui/material";
import React from "react";
import { FastRewind } from "@mui/icons-material";
import { RewindLinks } from "@rewind/feature-replay-viewer";

function Socials() {
  return (
    <Stack direction={"row"} gap={2}>
      <IconButton href={discordUrl} target={"_blank"}>
        <FaDiscord />
      </IconButton>
      <IconButton href={discordUrl} target={"_blank"}>
        <FaTwitter />
      </IconButton>
      <IconButton href={discordUrl} target={"_blank"}>
        <FaYoutube />
      </IconButton>
    </Stack>
  );
}

export function HomeScreen() {
  return (
    <Stack gap={4} sx={{ justifyContent: "center", alignItems: "center", margin: "auto", height: "100%" }}>
      <Stack alignItems={"center"}>
        <FastRewind sx={{ height: "2em", width: "2em" }} />
        <Typography fontSize={"1em"} sx={{ userSelect: "none", marginBottom: 2 }}>
          REWIND
        </Typography>
        <Typography fontSize={"caption.fontSize"} color={"text.secondary"}>
          {/*TODO: Version dynamic*/}
          Rewind v0.0.2 by{" "}
          <Link href={RewindLinks.abstraktOsu} target={"_blank"} color={"text.secondary"}>
            abstrakt
          </Link>
        </Typography>
        <Typography fontSize={"caption.fontSize"} color={"text.secondary"}>
          osu! University
          <IconButton href={discordUrl} target={"_blank"} size={"small"}>
            <FaDiscord />
          </IconButton>
          <IconButton href={twitterUrl} target={"_blank"} size={"small"}>
            <FaTwitter />
          </IconButton>
          <IconButton href={youtubeUrl} target={"_blank"} size={"small"}>
            <FaYoutube />
          </IconButton>
        </Typography>
        {/*<Typography color={"text.secondary"} fontSize={"0.8em"}>*/}
        {/*  by{" "}*/}
        {/*  <Link href={RewindLinks.abstraktOsu} target={"_blank"} color={"text.secondary"}>*/}
        {/*    abstrakt*/}
        {/*  </Link>*/}
        {/*</Typography>*/}
      </Stack>
      {/*<Socials />*/}
    </Stack>
  );
}
