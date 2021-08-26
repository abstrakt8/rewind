// Asks for the user
import * as React from "react";
import { RewindLogo, RewindSidebarLogo } from "../RewindSidebarLogo";
import { FolderOpenIcon } from "@heroicons/react/solid";

function Button() {
  return <div></div>;
}

function DirectorySelection() {
  return (
    <div className={"rounded flex flex-row px-4 py-2 justify-between bg-gray-600 items-center"}>
      <span className={"text-gray-400 "}>Select your osu! directory</span>
      <button>
        <FolderOpenIcon className={"h-6 w-6"} />
      </button>
    </div>
  );
}

export function SetupScreen() {
  return (
    <div className={"h-screen bg-gray-800 flex flex-item items-center justify-center text-gray-200"}>
      <div className={"bg-gray-700 w-96 py-4 px-6 rounded flex flex-col gap-4"}>
        <RewindLogo />
        <DirectorySelection />
        <div className={"flex flex-row-reverse"}>
          <button className={"bg-blue-600 hover:bg-blue-700 py-1 px-2 rounded"}>Save & Restart</button>
        </div>
      </div>
    </div>
  );
}
