import { RewindLogo } from "./RewindLogo";
import { Badge, Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { Home } from "@mui/icons-material";
import { FaMicroscope } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { push } from "connected-react-router";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { useAppInfo } from "@rewind/feature-replay-viewer";
import UpdateIcon from "@mui/icons-material/Update";

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
// const repoOwner = "pixijs";
// const repoName = "pixijs";

const latestReleaseUrl = `https://github.com/${repoOwner}/${repoName}/releases/latest`;
const latestReleaseApi = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

function useCheckForUpdate() {
  const { appVersion } = useAppInfo();
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
  return state;
}

export function LeftMenuSidebar() {
  // const LinkBehavior = React.forwardRef((props, ref) => <Link ref={ref} to="/" {...props} role={undefined} />);
  const dispatch = useAppDispatch();
  const pathname = useAppSelector((state) => state.router.location.pathname);

  const handleLinkClick = (to: string) => () => dispatch(push(to));
  const buttonColor = (name: string) => (name === pathname ? "primary" : "default");
  const updateState = useCheckForUpdate();

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
      <Box onClick={handleLinkClick("/home")} sx={{ cursor: "pointer" }}>
        <RewindLogo />
      </Box>
      <Divider orientation={"horizontal"} sx={{ borderWidth: 1, width: "80%" }} />
      <Tooltip title={"Overview"} placement={"right"}>
        <IconButton color={buttonColor("/home")} onClick={handleLinkClick("/home")}>
          <Home />
        </IconButton>
      </Tooltip>
      <Tooltip title={"Analyzer"} placement={"right"}>
        <IconButton
          // These are not centered
          onClick={handleLinkClick("/analyzer")}
          color={buttonColor("/analyzer")}
        >
          <FaMicroscope height={"0.75em"} />
        </IconButton>
      </Tooltip>
      {/*Nothing*/}
      <Box flexGrow={1} />
      {updateState.hasNewUpdate && (
        <Tooltip title={`New version ${updateState.latestVersion} available!`} placement={"right"}>
          <IconButton onClick={() => window.open(latestReleaseUrl)}>
            <Badge variant={"dot"} color={"error"}>
              <UpdateIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
