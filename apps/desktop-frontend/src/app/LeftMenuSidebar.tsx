import { RewindLogo } from "./RewindLogo";
import { Badge, Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { Home } from "@mui/icons-material";
import { FaMicroscope } from "react-icons/fa";
import React from "react";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import UpdateIcon from "@mui/icons-material/Update";
import { setUpdateModalOpen } from "./update/slice";
import { useLocation } from "react-router";
import { Link, useNavigate } from "react-router-dom";

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
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { newVersion } = useAppSelector((state) => state.updater);

  const openUpdateModal = () => dispatch(setUpdateModalOpen(true));
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
