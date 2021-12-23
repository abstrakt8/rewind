import { RewindLogo } from "./RewindLogo";
import { Badge, Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { Home } from "@mui/icons-material";
import { FaMicroscope } from "react-icons/fa";
import React from "react";
import { push } from "connected-react-router";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import UpdateIcon from "@mui/icons-material/Update";
import { setUpdateModalOpen } from "./update/slice";

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

export function LeftMenuSidebar() {
  // const LinkBehavior = React.forwardRef((props, ref) => <Link ref={ref} to="/" {...props} role={undefined} />);
  const dispatch = useAppDispatch();
  const pathname = useAppSelector((state) => state.router.location.pathname);
  const { newVersion } = useAppSelector((state) => state.updater);

  const openUpdateModal = () => dispatch(setUpdateModalOpen(true));
  const handleLinkClick = (to: string) => () => dispatch(push(to));
  const buttonColor = (name: string) => (name === pathname ? "primary" : "default");

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
      <Tooltip title={newVersion === null ? "No updates" : `New version ${newVersion} available!`} placement={"right"}>
        <IconButton onClick={openUpdateModal}>
          <Badge variant={"dot"} color={"error"} invisible={newVersion === null}>
            <UpdateIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
