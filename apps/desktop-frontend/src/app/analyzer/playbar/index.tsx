import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Popover, Slider, Stack } from "@mui/material";
import { Help, MoreVert, PhotoCamera, PlayCircle, VolumeUp } from "@mui/icons-material";
import { useState } from "react";
import { AudioSettings } from "./AudioSettings";
import { ReplayBar } from "../../../../../../libs/feature-replay-viewer/src/react/ReplayBar";

const centerUp = {
  anchorOrigin: {
    vertical: "top",
    horizontal: "center",
  },
  transformOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
};

function MoreMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls="long-menu"
        // aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PhotoCamera />
          </ListItemIcon>
          <ListItemText>Take Screenshot</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText>Help</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

function AudioButton() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton onClick={handleClick}>
        <VolumeUp />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Box width={256}>
          <AudioSettings />
        </Box>
      </Popover>
    </>
  );
}

export function Playbar() {
  return (
    <Stack height={64} gap={2} p={2} direction={"row"} alignItems={"center"}>
      <IconButton>
        <PlayCircle fontSize={"large"} />
      </IconButton>
      <ReplayBar backgroundEnable={true} />
      {/*<Slider size="medium" defaultValue={30} valueLabelDisplay="auto" />*/}

      <AudioButton />
      <MoreMenu />
    </Stack>
  );
}
