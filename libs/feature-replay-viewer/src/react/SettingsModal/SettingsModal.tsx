import { Box, Divider, IconButton, Slider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { forwardRef, useState } from "react";
import { Close, Settings as SettingsIcon, Visibility, VisibilityOff } from "@mui/icons-material";

function a11yProps(index: number) {
  return {};
}

const MyTab = ({ index, label }: { index: number; label: string }) => {
  return (
    <Tab
      id={`vertical-tab-${index}`}
      aria-controls={`vertical-tab-${index}`}
      label={label}
      tabIndex={index}
      sx={{ textTransform: "none" }}
    />
  );
};

export interface SettingsProps {}

const minOpacity = 10;
const maxOpacity = 100;

export function Settings() {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event: any, newValue: any) => {
    setTabIndex(newValue);
  };

  const [opacity, setOpacity] = useState(maxOpacity);

  return (
    //TODO : Add opacity = 1% button
    <Stack sx={{ filter: `opacity(${opacity}%)` }}>
      <Stack sx={{ py: 1, px: 2, alignItems: "center" }} direction={"row"} gap={1}>
        <SettingsIcon />
        <Typography fontWeight={"bolder"}>Settings</Typography>
        <Box flexGrow={1} />
        <Divider orientation={"vertical"} sx={{ height: "50%", width: "1px" }} />
        <IconButton>
          <Close />
        </IconButton>
      </Stack>
      <Divider />

      <Stack direction={"row"}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tabIndex}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          {/*<MyTab label={"General"} index={0} />*/}
          {/*<MyTab label={"Skins"} index={1} />*/}
          {/*<MyTab label={"Analyzer"} index={2} />*/}
          <Tab label={"General"} tabIndex={0} sx={{ textTransform: "none" }} />
          <Tab label={"Skins"} tabIndex={1} sx={{ textTransform: "none" }} />
          <Tab label={"Analyzer"} tabIndex={2} sx={{ textTransform: "none" }} />
          <Tab label={"About"} tabIndex={3} sx={{ textTransform: "none" }} />
        </Tabs>
      </Stack>
      <Divider />
      <Stack sx={{ p: 1 }} direction={"row"}>
        <Box flexGrow={1} />
        <Stack direction={"row"} alignItems={"center"} gap={2}>
          <IconButton onClick={() => setOpacity(minOpacity)}>
            <VisibilityOff />
          </IconButton>
          <Slider
            value={opacity}
            onChange={(_, v) => setOpacity(v as number)}
            step={5}
            min={minOpacity}
            max={maxOpacity}
            valueLabelFormat={(value: number) => `${value}%`}
            sx={{ width: "12em" }}
            valueLabelDisplay={"auto"}
          />
          <IconButton onClick={() => setOpacity(maxOpacity)}>
            <Visibility />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
