import { Box, Divider, IconButton, Paper, Slider, Stack, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import { Close, Settings as SettingsIcon, Visibility, VisibilityOff } from "@mui/icons-material";
import { PromotionFooter } from "./BaseDialog";

interface SettingTab {
  component: React.ReactNode;
  label: string;
}

export interface SettingsProps {
  onClose?: () => void;
  tabs: Array<SettingTab>;

  opacity: number;
  onOpacityChange: (o: number) => unknown;

  tabIndex: number;
  onTabIndexChange: (i: number) => unknown;
}

const MIN_OPACITY = 25;
const MAX_OPACITY = 100;

export function BaseSettingsModal(props: SettingsProps) {
  const { onClose, tabs, opacity, onOpacityChange, tabIndex, onTabIndexChange } = props;

  const handleTabChange = (event: any, newValue: any) => {
    onTabIndexChange(newValue);
  };

  const displayedTab = tabs[tabIndex].component;

  return (
    <Paper
      sx={{
        filter: `opacity(${opacity}%)`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      elevation={2}
    >
      <Stack sx={{ py: 1, px: 2, alignItems: "center" }} direction={"row"} gap={1}>
        <SettingsIcon />
        <Typography fontWeight={"bolder"}>Settings</Typography>
        <Box flexGrow={1} />
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>
      <Divider />
      <Stack direction={"row"} sx={{ flexGrow: 1, overflow: "auto" }}>
        {/*TODO: Holy moly, the CSS here needs to be changed a bit*/}
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tabIndex}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: "divider", position: "absolute" }}
        >
          {tabs.map(({ label }, index) => (
            <Tab label={label} key={index} tabIndex={index} sx={{ textTransform: "none" }} />
          ))}
        </Tabs>
        {/*TODO: For example this should not (?) be hardcoded */}
        <Box sx={{ marginLeft: "90px" }}>{displayedTab}</Box>
      </Stack>
      <Divider />
      <Stack sx={{ px: 2, py: 1, flexDirection: "row", alignItems: "center" }}>
        <PromotionFooter />
        <Box flexGrow={1} />
        <Stack direction={"row"} alignItems={"center"} gap={2}>
          <IconButton onClick={() => onOpacityChange(MIN_OPACITY)}>
            <VisibilityOff />
          </IconButton>
          <Slider
            value={opacity}
            onChange={(_, v) => onOpacityChange(v as number)}
            step={5}
            min={MIN_OPACITY}
            max={MAX_OPACITY}
            valueLabelFormat={(value: number) => `${value}%`}
            sx={{ width: "12em" }}
            valueLabelDisplay={"auto"}
          />
          <IconButton onClick={() => onOpacityChange(MAX_OPACITY)}>
            <Visibility />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
