import { RewindLogo } from "./RewindLogo";
import { Box, Divider, List, ListItem, ListItemButton, Stack, Tooltip } from "@mui/material";
import { Home, Settings } from "@mui/icons-material";
import { FaMicroscope } from "react-icons/fa";

export function LeftMenuSidebar() {
  return (
    <Stack
      sx={{
        width: (theme) => theme.spacing(10),
      }}
      gap={1}
      p={1}
      alignItems={"center"}
      component={"nav"}
    >
      <RewindLogo />
      <Divider orientation={"horizontal"} sx={{ borderWidth: 1, width: "80%" }} />
      <List>
        <ListItem>
          <ListItemButton>
            <Home />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <Tooltip title={"Analyzer"}>
            <ListItemButton
              // These are not centered
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <FaMicroscope />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
      {/*Nothing*/}
      <Box flexGrow={1} />
      <List>
        <ListItem>
          <ListItemButton>
            <Settings />
          </ListItemButton>
        </ListItem>
      </List>
    </Stack>
  );
}
