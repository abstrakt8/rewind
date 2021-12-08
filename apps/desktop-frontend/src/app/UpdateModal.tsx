import { Box, Button, Divider, IconButton, LinearProgress, Link, Modal, Paper, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { setUpdateModalOpen } from "./update/slice";
import { Close } from "@mui/icons-material";
import React from "react";
import { useAppInfo } from "@rewind/feature-replay-viewer";

const units = ["bytes", "KB", "MB", "GB", "TB", "PB"];

function niceBytes(x: any) {
  let l = 0,
    n = parseInt(x, 10) || 0;
  while (n >= 1024 && ++l) {
    n = n / 1024;
  }
  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
}

function versionUrl(version: string) {
  const repoOwner = "abstrakt8";
  const repoName = "rewind";
  // The version does not contain "v"
  return `https://github.com/${repoOwner}/${repoName}/releases/v${version}`;
}

export function UpdateModal() {
  const { modalOpen, newVersion, isDownloading, downloadedBytes, bytesPerSecond, downloadFinished, error, totalBytes } =
    useAppSelector((state) => state.updater);
  const dispatch = useAppDispatch();
  const handleClose = () => dispatch(setUpdateModalOpen(false));
  const { appVersion } = useAppInfo();

  const updateAvailable = newVersion !== null;
  const title = updateAvailable ? `Update available` : `Up to date`;

  const downloadProgress = (downloadedBytes / totalBytes) * 100;

  return (
    <Modal open={modalOpen} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <Paper elevation={1}>
          <Stack sx={{ px: 2, py: 1, alignItems: "center" }} direction={"row"} gap={1}>
            <Typography fontWeight={"bolder"}>{title}</Typography>
            <Box flexGrow={1} />
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
          <Divider />
          <Stack sx={{ px: 3, py: 2 }} direction={"row"} alignItems={"center"} gap={4}>
            {!updateAvailable && <Typography>You are on the latest version: {appVersion}</Typography>}
            {updateAvailable && (
              <Stack gap={2}>
                <Typography>
                  New Rewind version available:{" "}
                  <Link href={versionUrl(newVersion)} target={"_blank"} color={"text.secondary"}>
                    {newVersion}
                  </Link>
                </Typography>
                {isDownloading && (
                  <Typography>
                    {downloadFinished ? "Finished downloading!" : "Downloading..."}{" "}
                    <Typography variant={"caption"}>
                      {`${niceBytes(downloadedBytes)} / ${niceBytes(totalBytes)} (${downloadProgress.toFixed(2)} %)`}
                    </Typography>
                  </Typography>
                )}
                {isDownloading && <LinearProgress variant="determinate" value={downloadProgress} />}
                {downloadFinished && (
                  <Typography variant={"caption"}>Installation will happen when you close the application.</Typography>
                )}
                <Stack direction={"row-reverse"}>
                  {!downloadFinished && (
                    <Button
                      variant={"contained"}
                      onClick={() => window.api.startDownloadingUpdate()}
                      disabled={isDownloading}
                    >
                      Download update
                    </Button>
                  )}
                  {downloadFinished && (
                    <Button variant={"contained"} onClick={() => window.api.reboot()}>
                      Restart and install
                    </Button>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Modal>
  );
}
