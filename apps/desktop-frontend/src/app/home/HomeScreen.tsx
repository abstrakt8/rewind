import "./HomeScreen.css";
import { RewindLogo } from "../RewindSidebarLogo";
import { FaDiscord, FaTwitter, FaYoutube } from "react-icons/fa";

const discordUrl = "https://discord.gg/QubdHdnBVg";
const twitterUrl = "https://twitter.com/osuuniversity";
const youtubeUrl = "https://www.youtube.com/channel/UCzW2Z--fEw0LWKgVTmO-b6w";

function Socials() {
  return (
    <div className={"flex gap-4"}>
      <a href={discordUrl}>
        <FaDiscord className={"socials"} />
      </a>
      <a href={twitterUrl}>
        <FaTwitter className={"socials"} />
      </a>
      <a href={youtubeUrl}>
        <FaYoutube className={"socials"} />
      </a>
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className={"flex flex-col items-center gap-8 justify-center text-white m-auto text-gray-200"}>
      <RewindLogo />
      <Socials />
    </div>
  );
}
