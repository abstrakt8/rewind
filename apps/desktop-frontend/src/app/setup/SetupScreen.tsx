// Asks for the user
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useUpdateOsuDirectoryMutation } from "../backend/api";
import { Alert, Badge, Box, Button, IconButton, InputBase, Paper, Stack } from "@mui/material";
import { RewindLogo } from "../RewindLogo";
import { Help, Loop } from "@mui/icons-material";
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

const setupWikiUrl = "https://github.com/abstrakt8/rewind/wiki/Setup";

// TODO: Maybe tell which file is actually missing
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
          {showErrorMessage && (
            <>
              <Alert severity="error">
                <div>Does not look a valid osu! directory!</div>
              </Alert>
            </>
          )}
          <DirectorySelection
            value={directoryPath}
            onChange={handleOnDirectoryChange}
            placeHolder={"Select your osu! directory"}
            badgeOnEmpty={true}
          />
          <Stack direction={"row-reverse"} gap={2}>
            <Button variant={"contained"} startIcon={<Loop />} disabled={!saveEnabled} onClick={handleConfirmClick}>
              Save & Restart
            </Button>
            <Button variant={"text"} onClick={() => window.open(setupWikiUrl)} startIcon={<Help />}>
              Help
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
