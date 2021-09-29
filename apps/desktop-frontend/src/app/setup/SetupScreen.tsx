// Asks for the user
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { FolderOpenIcon } from "@heroicons/react/solid";
import { useUpdateOsuDirectoryMutation } from "../backend/api";
import { Alert, Badge, Box, Button, IconButton, InputBase, Paper, Stack, TextField } from "@mui/material";
import { RewindLogo } from "../RewindLogo";
import { Loop } from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";

interface DirectorySelectionProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeHolder: string;
  badgeOnEmpty?: boolean;
}

function DirectorySelection({ value, onChange, placeHolder, badgeOnEmpty }: DirectorySelectionProps) {
  const handleSelectFolderClick = useCallback(() => {
    window.api.selectDirectory(value ?? "").then((path) => {
      if (path !== null) {
        onChange(path);
      }
    });
  }, [onChange, value]);

  const onInputChange = useCallback(
    (event) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  const invisibleBadge = !badgeOnEmpty || !!value;
  return (
    <Paper sx={{ px: 2, py: 1, display: "flex", alignItems: "center", width: 400 }} elevation={2}>
      {/*<span className={"text-gray-400 select-none w-96"}>{value ?? placeHolder}</span>*/}
      <InputBase sx={{ flex: 1 }} placeholder={placeHolder} value={value} onChange={onInputChange} disabled={true} />
      <IconButton onClick={handleSelectFolderClick}>
        <Badge invisible={invisibleBadge} color={"primary"} variant={"dot"}>
          <FolderIcon />
        </Badge>
      </IconButton>
    </Paper>
  );
}

export function SetupScreen() {
  // TODO: Add a guess for directory path
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);

  const [updateOsuDirectory, updateState] = useUpdateOsuDirectoryMutation();
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleConfirmClick = useCallback(() => {
    if (directoryPath) {
      updateOsuDirectory({ osuStablePath: directoryPath });
    }
  }, [updateOsuDirectory, directoryPath]);

  useEffect(() => {
    if (updateState.isSuccess) {
      window.api.reboot();
    } else if (updateState.isError) {
      setShowErrorMessage(true);
    }
  }, [updateState, setShowErrorMessage]);

  const handleOnDirectoryChange = useCallback(
    (path: string | null) => {
      setDirectoryPath(path);
      setShowErrorMessage(false);
    },
    [setShowErrorMessage],
  );

  // Makes sure that the button is only clickable when it's allowed.
  useEffect(() => {
    setSaveEnabled(directoryPath !== null && !updateState.isLoading);
  }, [directoryPath, updateState.isLoading]);
  const errorMessage = "Does not look a valid osu! directory.";

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={1}>
        <Stack gap={2} sx={{ px: 6, py: 4 }}>
          <RewindLogo />
          {showErrorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <DirectorySelection
            value={directoryPath}
            onChange={handleOnDirectoryChange}
            placeHolder={"Select your osu! directory"}
            badgeOnEmpty={true}
          />
          <Stack direction={"row-reverse"}>
            <Button variant={"contained"} startIcon={<Loop />} disabled={!saveEnabled} onClick={handleConfirmClick}>
              Save & Restart
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
    // <div className={"h-screen bg-gray-800 flex flex-item items-center justify-center text-gray-200"}>
    //   <div className={"bg-gray-700 w-auto py-4 px-6 rounded flex flex-col gap-8"}>
    //     <RewindLogo.tsx />
    //     {/*<DirectorySelection*/}
    //     {/*  placeHolder={"Select your osu! directory..."}*/}
    //     {/*  value={directoryPath}*/}
    //     {/*  onChange={handleOnDirectoryChange}*/}
    //     {/*  pulseOnEmpty*/}
    //     {/*/>*/}
    //     {showErrorMessage && <div className={"text-red-500"}>Does not look like a valid osu! directory.</div>}
    //     <div className={"flex flex-row-reverse"}>
    //       <button
    //         className={`${
    //           saveEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-default text-gray-500"
    //         } py-2 px-4 rounded select-none`}
    //         disabled={!saveEnabled}
    //         onClick={handleConfirmClick}
    //       >
    //         <span>Save & Restart</span>
    //       </button>
    //     </div>
    //   </div>
    // </div>
  );
}
