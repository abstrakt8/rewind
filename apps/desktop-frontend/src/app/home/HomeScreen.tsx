import { RewindLogo } from "../RewindLogo";
import { FaDiscord, FaTwitter, FaYoutube } from "react-icons/fa";
import { discordUrl, twitterUrl, youtubeUrl } from "../../react/Constants";
import { Stack } from "@mui/material";

function Socials() {
  return (
    <Stack direction={"row"} gap={2}>
      <a href={discordUrl} target={"_blank"}>
        <FaDiscord className={"socials"} />
      </a>
      <a href={twitterUrl} target={"_blank"}>
        <FaTwitter className={"socials"} />
      </a>
      <a href={youtubeUrl} target={"_blank"}>
        <FaYoutube className={"socials"} />
      </a>
    </Stack>
  );
}

export function HomeScreen() {
  return (
    <Stack gap={2} sx={{ justifyContent: "center", alignItems: "center", margin: "auto", height: "100%" }}>
      <RewindLogo />
      <Socials />
    </Stack>
  );
}
