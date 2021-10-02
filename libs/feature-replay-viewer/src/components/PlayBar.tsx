import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { Help, MoreVert, PauseCircle, PhotoCamera, PlayCircle, Settings, VolumeUp } from "@mui/icons-material";
import { useCallback, useMemo, useState } from "react";
import { BaseAudioSettingsPanel } from "./BaseAudioSettingsPanel";
import { BaseGameTimeSlider } from "./BaseGameTimeSlider";
import { useGameClockControls, useGameClockTime } from "../hooks/gameClock";
import { formatGameTime } from "@rewind/osu/math";
import { useAudioSettings, useAudioSettingsService } from "../hooks/audio";
import { useModControls } from "../hooks/mods";
import modHiddenImg from "../../assets/mod_hidden.cfc32448.png";
import { ALLOWED_SPEEDS } from "../utils/Constants";
import { BaseCurrentTime, ignoreFocus, useAnalysisApp, useTheater } from "..";
import { useSettingsModalContext } from "../providers/SettingsProvider";
import { PlaybarColors } from "../utils/PlaybarColors";
import { ReplayAnalysisEvent } from "@rewind/osu/core";
import { useObservable } from "rxjs-hooks";

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
  const { volume, muted } = useAudioSettings();
  const service = useAudioSettingsService();

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
          <BaseAudioSettingsPanel
            master={volume.master}
            music={volume.music}
            /* Currently it's disabled */
            effects={0}
            onMasterChange={(x) => service.setMasterVolume(x)}
            onMusicChange={(x) => service.setMusicVolume(x)}
            onEffectsChange={(x) => service.setEffectsVolume(x)}
          />
        </Box>
      </Popover>
    </>
  );
}

// Connected
function PlayButton() {
  const { isPlaying, toggleClock } = useGameClockControls();
  const Icon = !isPlaying ? PlayCircle : PauseCircle;

  return (
    <IconButton onClick={toggleClock} onFocus={ignoreFocus}>
      <Icon fontSize={"large"} />
    </IconButton>
  );
}

function CurrentTime() {
  const currentTime = useGameClockTime(60);
  return (
    // We MUST fix the width because the font is not monospace e.g. "111" is thinner than "000"
    // Also if the duration is more than an hour there will also be a slight shift
    <Box sx={{ width: "6em" }}>
      <BaseCurrentTime currentTime={currentTime} />
    </Box>
  );
}

function groupTimings(events: ReplayAnalysisEvent[]) {
  const missTimings: number[] = [];
  const mehTimings: number[] = [];
  const okTimings: number[] = [];
  const sliderBreakTimings: number[] = [];

  events.forEach((e) => {
    switch (e.type) {
      case "HitObjectJudgement":
        // TODO: for lazer style, this needs some rework
        if (e.isSliderHead) {
          if (e.verdict === "MISS") missTimings.push(e.time);
          return;
        } else {
          if (e.verdict === "MISS") missTimings.push(e.time);
          if (e.verdict === "MEH") mehTimings.push(e.time);
          if (e.verdict === "OK") okTimings.push(e.time);
        }
        // if(e.verdict === "GREAT" && show300s) events.push(); // Not sure if this will ever be implemented
        break;
      case "CheckpointJudgement":
        if (!e.hit && !e.isLastTick) sliderBreakTimings.push(e.time);
        break;
      case "UnnecessaryClick":
        // TODO
        break;
    }
  });
  return { missTimings, mehTimings, okTimings, sliderBreakTimings };
}

function GameTimeSlider() {
  // TODO: Depending on if replay is loaded and settings
  const backgroundEnable = true;
  const currentTime = useGameClockTime(30);
  const { seekTo, duration } = useGameClockControls();
  const { gameSimulator } = useAnalysisApp();
  const events = useObservable(() => gameSimulator.replayEvents$, []);

  const { sliderBreakTimings, missTimings, mehTimings, okTimings } = useMemo(() => groupTimings(events), [events]);

  return (
    <BaseGameTimeSlider
      backgroundEnable={backgroundEnable}
      duration={duration}
      currentTime={currentTime}
      onChange={seekTo}
      events={[
        { color: PlaybarColors.MISS, timings: missTimings, tooltip: "Misses" },
        { color: PlaybarColors.SLIDER_BREAK, timings: sliderBreakTimings, tooltip: "Sliderbreaks" },
        { color: PlaybarColors.MEH, timings: mehTimings, tooltip: "50s" },
        { color: PlaybarColors.OK, timings: okTimings, tooltip: "100s" },
      ]}
    />
  );
}

function Duration() {
  const { duration } = useGameClockControls();
  const f = formatGameTime(duration);

  return <Typography>{f}</Typography>;
}

function HiddenButton() {
  const { setHidden, hidden } = useModControls();
  const handleClick = useCallback(() => setHidden(!hidden), [hidden, setHidden]);

  return (
    <IconButton onFocus={ignoreFocus} sx={{ width: "2em", height: "2em" }} onClick={handleClick}>
      <img src={modHiddenImg} alt={"ModHidden"} className={`filter ${hidden ? "grayscale-0" : "grayscale"} `} />
    </IconButton>
  );
}

function SettingsButton() {
  const { onSettingsModalOpenChange } = useSettingsModalContext();
  return (
    <IconButton onClick={() => onSettingsModalOpenChange(true)} onFocus={ignoreFocus}>
      <Settings />
    </IconButton>
  );
}

interface BaseSpeedButtonProps {
  value: number;
  onChange: (value: number) => any;
}

const speedLabels: Record<number, string> = { 0.75: "HT", 1.5: "DT" } as const;

function BaseSpeedButton(props: BaseSpeedButtonProps) {
  const { value, onChange } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const formatSpeed = (s: number) => `${s}x`;

  // Floating point issues?

  return (
    <>
      <IconButton
        color={"inherit"}
        onClick={handleClick}
        // size={"small"}
        // sx={{ width: "content" }}
        // sx={{ fontSize: (theme) => theme.typography.fontSize }}
      >
        <Typography>{formatSpeed(value)}</Typography>
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
        <MenuList>
          {ALLOWED_SPEEDS.map((s) => (
            <MenuItem
              key={s}
              onClick={() => {
                onChange(s);
                handleClose();
              }}
              sx={{ width: "120px", maxWidth: "100%" }}
            >
              <ListItemText>{formatSpeed(s)}</ListItemText>
              <Typography variant="body2" color="text.secondary">
                {speedLabels[s] ?? ""}
              </Typography>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
}

function SpeedButton() {
  const { speed, setSpeed } = useGameClockControls();
  return <BaseSpeedButton value={speed} onChange={setSpeed} />;
}

const VerticalDivider = () => <Divider orientation={"vertical"} sx={{ height: "80%" }} />;

export function PlayBar() {
  return (
    <Stack height={64} gap={1} p={2} direction={"row"} alignItems={"center"}>
      <PlayButton />
      <CurrentTime />
      <GameTimeSlider />
      <Duration />
      <VerticalDivider />
      <Stack direction={"row"} alignItems={"center"}>
        <AudioButton />
        <SpeedButton />
        <HiddenButton />
        <SettingsButton />
        <MoreMenu />
      </Stack>
    </Stack>
  );
}
