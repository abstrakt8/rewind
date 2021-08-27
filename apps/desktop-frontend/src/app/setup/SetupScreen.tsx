// Asks for the user
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { RewindLogo } from "../RewindSidebarLogo";
import { FolderOpenIcon } from "@heroicons/react/solid";
import { useUpdateOsuDirectoryMutation } from "../backend/api";

interface DirectorySelectionProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeHolder: string;
  pulseOnEmpty?: boolean;
}

function DirectorySelection({ value, onChange, placeHolder, pulseOnEmpty }: DirectorySelectionProps) {
  const handleSelectFolderClick = useCallback(() => {
    window.api.send("openDirectorySelect", value ?? "");
  }, [value]);

  useEffect(() => {
    const unsubscribe = window.api.receive("directorySelected", (path: string | null) => {
      // Otherwise it's weird, if the user suddenly loses their input on cancelling
      if (path !== null) {
        onChange(path);
      }
    });
    return () => unsubscribe();
  }, [onChange]);

  const showAnimatePulse = pulseOnEmpty && value === null;

  return (
    <div className={"rounded flex flex-row px-4 py-2 justify-between bg-gray-600 items-center gap-4"}>
      <span className={"text-gray-400 select-none w-96"}>{value ?? placeHolder}</span>
      <button onClick={handleSelectFolderClick}>
        <FolderOpenIcon className={`h-6 w-6  ${showAnimatePulse && "animate-pulse"}`} />
      </button>
    </div>
  );
}

export function SetupScreen() {
  // TODO: Add a guess for directory path
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);

  const [updateOsuDirectory, updateState] = useUpdateOsuDirectoryMutation();

  const handleConfirmClick = useCallback(() => {
    if (directoryPath) {
      updateOsuDirectory({ osuStablePath: directoryPath });
    }
  }, [updateOsuDirectory, directoryPath]);

  useEffect(() => {
    if (updateState.isSuccess) {
      window.api.send("reboot");
    } else {
      // TODO
    }
  }, [updateState]);

  // TODO: Maybe refactor?
  useEffect(() => {
    setSaveEnabled(directoryPath !== null && !updateState.isLoading);
  }, [directoryPath, updateState.isLoading]);

  return (
    <div className={"h-screen bg-gray-800 flex flex-item items-center justify-center text-gray-200"}>
      <div className={"bg-gray-700 w-auto py-4 px-6 rounded flex flex-col gap-8"}>
        <RewindLogo />
        <DirectorySelection
          placeHolder={"Select your osu! directory..."}
          value={directoryPath}
          onChange={setDirectoryPath}
          pulseOnEmpty
        />
        <div className={"flex flex-row-reverse"}>
          <button
            className={`${
              saveEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-default text-gray-500"
            } py-2 px-4 rounded select-none`}
            disabled={!saveEnabled}
            onClick={handleConfirmClick}
          >
            <span>Save & Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
