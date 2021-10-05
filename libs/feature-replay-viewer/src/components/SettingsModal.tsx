import { useSettingsModalContext } from "../providers/SettingsProvider";
import {
  Autocomplete,
  Box,
  FormControlLabel,
  FormGroup,
  Modal,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { BaseSettingsModal } from "./BaseSettingsModal";
import { useTheater } from "../providers/TheaterProvider";
import { useCallback } from "react";
import {
  DEFAULT_ANALYSIS_CURSOR_SETTINGS,
  DEFAULT_BEATMAP_RENDER_SETTINGS,
  DEFAULT_OSU_SKIN_ID,
  DEFAULT_REPLAY_CURSOR_SETTINGS,
  DEFAULT_REWIND_SKIN_ID,
  DEFAULT_SKIN_SETTINGS,
  SkinId,
  SkinSource,
  stringToSkinId,
} from "@rewind/web-player/rewind";
import { useObservable } from "rxjs-hooks";

const sourceName: Record<SkinSource, string> = {
  osu: "osu!/Skins Folder",
  rewind: "Rewind",
};

function BeatmapBackgroundSettings() {
  const theater = useTheater();
  const { beatmapBackgroundSettingsStore } = theater;
  const settings = useObservable(() => beatmapBackgroundSettingsStore.settings$, { blur: 0, enabled: false, dim: 0 });
  return (
    <Stack>
      <Typography>Background blur</Typography>
      <Slider
        value={Math.round(settings.blur * 100)}
        onChange={(_, v) => beatmapBackgroundSettingsStore.setBlur((v as number) / 100)}
        valueLabelDisplay={"auto"}
      />
      <Typography>Background dim</Typography>
      <Slider
        value={Math.round(settings.dim * 100)}
        onChange={(_, v) => beatmapBackgroundSettingsStore.setDim((v as number) / 100)}
        valueLabelDisplay={"auto"}
      />
    </Stack>
  );
}

function BeatmapRenderSettings() {
  const { beatmapRenderSettingsStore } = useTheater();
  const settings = useObservable(() => beatmapRenderSettingsStore.settings$, DEFAULT_BEATMAP_RENDER_SETTINGS);

  return (
    <Stack>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings.sliderDevMode}
              onChange={(event) => beatmapRenderSettingsStore.setSliderDevMode(event.target.checked)}
            />
          }
          label={"Slider Dev Mode"}
        />
      </FormGroup>
      {/*  draw slider ends*/}
    </Stack>
  );
}

function AnalysisCursorSettingsPanel() {
  const { analysisCursorSettingsStore } = useTheater();
  const settings = useObservable(() => analysisCursorSettingsStore.settings$, DEFAULT_ANALYSIS_CURSOR_SETTINGS);

  return (
    <Stack gap={2}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enabled}
              onChange={(event) => analysisCursorSettingsStore.setEnabled(event.target.checked)}
            />
          }
          label={"Analysis Cursor"}
        />
      </FormGroup>
    </Stack>
  );
}

function ReplayCursorSettingsPanel() {
  const { replayCursorSettingsStore } = useTheater();
  const settings = useObservable(() => replayCursorSettingsStore.settings$, DEFAULT_REPLAY_CURSOR_SETTINGS);

  return (
    <Stack gap={2}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enabled}
              onChange={(event) => replayCursorSettingsStore.changeSettings((s) => (s.enabled = event.target.checked))}
            />
          }
          label={"Replay Cursor"}
        />
      </FormGroup>
    </Stack>
  );
}

function GeneralSettings() {
  return (
    <Stack p={2}>
      <BeatmapBackgroundSettings />
      <BeatmapRenderSettings />
      <ReplayCursorSettingsPanel />
      <AnalysisCursorSettingsPanel />
    </Stack>
  );
}

function SkinsSettings() {
  // TODO: Button for synchronizing skin list again

  const theater = useTheater();

  const { preferredSkinId } = useObservable(() => theater.skinSettingsStore.settings$, DEFAULT_SKIN_SETTINGS);
  const chosenSkinId = stringToSkinId(preferredSkinId);

  const skinOptions: SkinId[] = [
    DEFAULT_OSU_SKIN_ID,
    DEFAULT_REWIND_SKIN_ID,
    { source: "osu", name: "- # BTMC   ⌞Freedom Dive  ↓⌝" },
    { source: "osu", name: "-         《CK》 WhiteCat 2.1 _ old -lite" },
    { source: "osu", name: "idke+1.2" },
    { source: "osu", name: "Joie's Seoul v9 x owoTuna + whale" },
    { source: "osu", name: "Millhiore Lite" },
    { source: "osu", name: "Rafis 2018-03-26 HDDT" },
    { source: "osu", name: "Toy 2018-09-07" },
  ];

  // TODO:

  const handleSkinChange = useCallback(
    (skinId: SkinId) => {
      (async function () {
        try {
          await theater.skinManager.loadSkin(skinId);
        } catch (e) {
          // Show some error dialog
          console.error(`Could not load skin ${skinId}`);
        }
      })();
      // TODO: ERror handling
    },
    [theater],
  );

  return (
    <Box sx={{ p: 2 }}>
      <Autocomplete
        id="skin-selection-demo"
        // TODO: Make sure skinIds are sorted
        options={skinOptions}
        groupBy={(option: SkinId) => sourceName[option.source]}
        value={chosenSkinId}
        onChange={(event, newValue) => {
          if (newValue) {
            handleSkinChange(newValue as SkinId);
          }
        }}
        getOptionLabel={(option: SkinId) => option.name}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Skin" />}
        isOptionEqualToValue={(option, value) => option.name === value.name && option.source === value.source}
      />
    </Box>
  );
}

export function SettingsModal() {
  const { onSettingsModalOpenChange, settingsModalOpen, opacity, onTabIndexChange, onOpacityChange, tabIndex } =
    useSettingsModalContext();
  const onClose = () => onSettingsModalOpenChange(false);

  return (
    <Modal
      open={settingsModalOpen}
      onClose={onClose}
      hideBackdrop={false}
      sx={{
        // We reduce the default backdrop from 0.5 alpha to 0.1 in order for the user to better see the background
        // behind the modal
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          maxWidth: "100%",
          height: 600,
          maxHeight: "100%",
        }}
      >
        <BaseSettingsModal
          opacity={opacity}
          tabIndex={tabIndex}
          onTabIndexChange={onTabIndexChange}
          onOpacityChange={onOpacityChange}
          onClose={onClose}
          tabs={[
            { label: "General", component: <GeneralSettings /> },
            {
              label: "Skins",
              component: <SkinsSettings />,
            },
          ]}
        />
      </Box>
    </Modal>
  );
}
