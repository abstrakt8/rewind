import "./HomeScreen.css";
import { RewindLogo } from "../RewindLogo";
import { FaDiscord, FaTwitter, FaYoutube } from "react-icons/fa";
import { discordUrl, twitterUrl, youtubeUrl } from "../../react/Constants";

function Socials() {
  return (
    <div className={"flex gap-4"}>
      <a href={discordUrl} target={"_blank"}>
        <FaDiscord className={"socials"} />
      </a>
      <a href={twitterUrl} target={"_blank"}>
        <FaTwitter className={"socials"} />
      </a>
      <a href={youtubeUrl} target={"_blank"}>
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
