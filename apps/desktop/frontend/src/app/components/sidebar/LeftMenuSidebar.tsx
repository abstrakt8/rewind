import { RewindLogo } from "../logo/RewindLogo";
import { Badge, Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { Home } from "@mui/icons-material";
import { FaMicroscope } from "react-icons/fa";
import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import UpdateIcon from "@mui/icons-material/Update";
import { setUpdateModalOpen } from "../../store/update/slice";
import { useLocation } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import { useAppInfo } from "@rewind/feature-replay-viewer";
import { ELECTRON_UPDATE_FLAG } from "../../constants";

const tooltipPosition = {
  anchorOrigin: {
    vertical: "center",
    horizontal: "right",
  },
  transformOrigin: {
    vertical: "center",
    horizontal: "left",
  },
};

const repoOwner = "abstrakt8";
const repoName = "rewind";

const latestReleaseUrl = `https://github.com/${repoOwner}/${repoName}/releases/latest`;
const latestReleaseApi = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

function useCheckForUpdate() {
  const { appVersion } = useAppInfo();
  const { newVersion } = useAppSelector((state) => state.updater);
  const [state, setState] = useState<{ hasNewUpdate: boolean; latestVersion: string }>({
    hasNewUpdate: false,
    latestVersion: "",
  });
  useEffect(() => {
    (async function () {
      const response = await fetch(latestReleaseApi);
      const json = await response.json();

      // Should be something like "v0.1.0"
      const tagName = json["tag_name"] as string;
      if (!tagName) {
        return;
      }
      // Removes the "v" prefix
      const latestVersion = tagName.substring(1);
      const hasNewUpdate = appVersion !== latestVersion;
      setState({ hasNewUpdate, latestVersion });
      console.log(
        `Current release: ${appVersion} and latest release: ${latestVersion}, therefore hasNewUpdate=${hasNewUpdate}`,
      );
    })();
  }, [appVersion]);

  if (ELECTRON_UPDATE_FLAG) {
    return { hasNewUpdate: newVersion !== appVersion, latestVersion: newVersion };
  } else {
    return state;
  }
}

export function LeftMenuSidebar() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const state = useCheckForUpdate();

  const openUpdateModal = () => dispatch(setUpdateModalOpen(true));

  const onNewUpdateAvailableButtonClick = useCallback(() => {
    if (ELECTRON_UPDATE_FLAG) {
      openUpdateModal();
    } else {
      window.open(latestReleaseUrl);
    }
  }, []);
  const handleLinkClick = (to: string) => () => navigate(to);
  const buttonColor = (name: string) => (location.pathname.endsWith(name) ? "primary" : "default");

  return (
    <Stack
      sx={{
        width: (theme) => theme.spacing(10),
        paddingBottom: 2,
      }}
      gap={1}
      p={1}
      alignItems={"center"}
      component={"nav"}
    >
      <Box onClick={handleLinkClick("home")} sx={{ cursor: "pointer" }}>
        <RewindLogo />
      </Box>
      <Divider orientation={"horizontal"} sx={{ borderWidth: 1, width: "80%" }} />
      <Tooltip title={"Overview"} placement={"right"}>
        <Link to={"home"}>
          <IconButton color={buttonColor("/home")}>
            <Home />
          </IconButton>
        </Link>
      </Tooltip>
      <Tooltip title={"Analyzer"} placement={"right"}>
        <Link to={"analyzer"}>
          <IconButton
            // These are not centered
            color={buttonColor("/analyzer")}
          >
            <FaMicroscope height={"0.75em"} />
          </IconButton>
        </Link>
      </Tooltip>
      {/*Nothing*/}
      <Box flexGrow={1} />
      <Tooltip
        title={state.hasNewUpdate ? `New version ${state.latestVersion} available!` : `You are on the latest version`}
        placement={"right"}
      >
        <IconButton onClick={onNewUpdateAvailableButtonClick}>
          <Badge variant={"dot"} color={"error"} invisible={!state.hasNewUpdate}>
            <UpdateIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
