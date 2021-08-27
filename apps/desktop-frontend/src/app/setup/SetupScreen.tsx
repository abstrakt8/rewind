// Asks for the user
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { RewindLogo } from "../RewindSidebarLogo";
import { FolderOpenIcon } from "@heroicons/react/solid";

interface DirectorySelectionProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeHolder: string;
}

function DirectorySelection({ value, onChange, placeHolder }: DirectorySelectionProps) {
  const handleSelectFolderClick = useCallback(() => {
    window.api.send("openDirectorySelect", value ?? "");
  }, [value]);

  useEffect(() => {
    const unsubscribe = window.api.receive("directorySelected", (path: string | null) => {
      onChange(path);
    });
    return () => unsubscribe();
  }, [onChange]);

  return (
    <div className={"rounded flex flex-row px-4 py-2 justify-between bg-gray-600 items-center"}>
      <span className={"text-gray-400 select-none"}>{value ?? placeHolder}</span>
      <button onClick={handleSelectFolderClick}>
        <FolderOpenIcon className={"h-6 w-6"} />
      </button>
    </div>
  );
}

export function SetupScreen() {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);

  const handleConfirmClick = useCallback(() => {
    // TODO: Send this to backend

    window.api.send("reboot");
  }, [directoryPath]);

  // TODO: Maybe refactor?
  useEffect(() => {
    setSaveEnabled(directoryPath !== null);
  }, [directoryPath]);

  return (
    <div className={"h-screen bg-gray-800 flex flex-item items-center justify-center text-gray-200"}>
      <div className={"bg-gray-700 w-96 py-4 px-6 rounded flex flex-col gap-8"}>
        <RewindLogo />
        <DirectorySelection
          placeHolder={"Select your osu! directory..."}
          value={directoryPath}
          onChange={setDirectoryPath}
        />
        <div className={"flex flex-row-reverse"}>
          <button
            className={`${
              saveEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-default text-gray-500"
            } py-2 px-4 rounded select-none`}
            disabled={!saveEnabled}
            onClick={handleConfirmClick}
          >
            Save & Restart
          </button>
        </div>
      </div>
    </div>
  );
}
