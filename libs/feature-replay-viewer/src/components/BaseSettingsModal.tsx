import { Box, Divider, IconButton, Link, Paper, Slider, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { forwardRef, useState } from "react";
import { Close, Settings as SettingsIcon, Visibility, VisibilityOff } from "@mui/icons-material";
import { FaDiscord } from "react-icons/all";
import { RewindLinks } from "../utils/Constants";

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

const minOpacity = 25;
const maxOpacity = 100;

export function BaseSettingsModal(props: SettingsProps) {
  const { onClose, tabs, opacity, onOpacityChange, tabIndex, onTabIndexChange } = props;

  const handleTabChange = (event: any, newValue: any) => {
    onTabIndexChange(newValue);
  };

  const displayedTab = tabs[tabIndex].component;

  return (
    <Paper
      sx={{ filter: `opacity(${opacity}%)`, height: "100%", display: "flex", flexDirection: "column" }}
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
      <Stack direction={"row"} sx={{ flexGrow: 1 }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tabIndex}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          {tabs.map(({ label }, index) => (
            <Tab label={label} key={index} tabIndex={index} sx={{ textTransform: "none" }} />
          ))}
        </Tabs>
        {displayedTab}
      </Stack>
      <Divider />
      <Stack sx={{ px: 2, py: 1, flexDirection: "row", alignItems: "center" }}>
        <Typography fontSize={"caption.fontSize"} color={"text.secondary"}>
          {/*TODO: Version dynamic*/}
          Rewind v0.0.2 by{" "}
          <Link href={RewindLinks.abstraktOsu} target={"_blank"} color={"text.secondary"}>
            abstrakt
          </Link>{" "}
          | osu! University
          <IconButton href={RewindLinks.OsuUniDiscord} target={"_blank"} size={"small"}>
            <FaDiscord />
          </IconButton>
        </Typography>
        <Box flexGrow={1} />
        <Stack direction={"row"} alignItems={"center"} gap={2}>
          <IconButton onClick={() => onOpacityChange(minOpacity)}>
            <VisibilityOff />
          </IconButton>
          <Slider
            value={opacity}
            onChange={(_, v) => onOpacityChange(v as number)}
            step={5}
            min={minOpacity}
            max={maxOpacity}
            valueLabelFormat={(value: number) => `${value}%`}
            sx={{ width: "12em" }}
            valueLabelDisplay={"auto"}
          />
          <IconButton onClick={() => onOpacityChange(maxOpacity)}>
            <Visibility />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
