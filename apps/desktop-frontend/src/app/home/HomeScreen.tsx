import "./HomeScreen.css";
import { RewindLogo } from "../RewindSidebarLogo";
import { FaDiscord, FaTwitter, FaYoutube } from "react-icons/fa";

function Socials() {
  return (
    <div className={"flex gap-4"}>
      <FaDiscord className={"socials"} />
      <FaTwitter className={"socials"} />
      <FaYoutube className={"socials"} />
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
