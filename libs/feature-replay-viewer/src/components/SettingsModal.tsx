import { useSettingsModalContext } from "../providers/SettingsProvider";
import {
  Autocomplete,
  Box,
  FormControlLabel,
  FormGroup,
  Modal,
  Paper,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { BaseSettingsModal } from "./BaseSettingsModal";
import { useCommonManagers } from "../providers/TheaterProvider";
import { useCallback, useEffect, useMemo } from "react";
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
import { DEFAULT_HIT_ERROR_BAR_SETTINGS } from "../../../web-player/rewind/src/settings/HitErrorBarSettings";
import { DEFAULT_PLAY_BAR_SETTINGS } from "../../../web-player/rewind/src/settings/PlaybarSettings";

const sourceName: Record<SkinSource, string> = {
  osu: "osu!/Skins Folder",
  rewind: "Rewind",
};

const formatToPercent = (value: number) => `${value}%`;

function BeatmapBackgroundSettings() {
  const theater = useCommonManagers();
  const { beatmapBackgroundSettingsStore } = theater;
  const settings = useObservable(() => beatmapBackgroundSettingsStore.settings$, { blur: 0, enabled: false, dim: 0 });
  return (
    <Paper sx={{ boxShadow: "none", p: 2 }}>
      <Stack gap={1}>
        <Typography variant={"h6"}>Beatmap Background</Typography>
        <Stack>
          <Typography>Blur</Typography>
          <Slider
            value={Math.round(settings.blur * 100)}
            onChange={(_, v) => beatmapBackgroundSettingsStore.setBlur((v as number) / 100)}
            valueLabelDisplay={"auto"}
            valueLabelFormat={formatToPercent}
          />
          <Typography>Dim</Typography>
          <Slider
            value={Math.round(settings.dim * 100)}
            onChange={(_, v) => beatmapBackgroundSettingsStore.setDim((v as number) / 100)}
            valueLabelDisplay={"auto"}
            valueLabelFormat={formatToPercent}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

function BeatmapRenderSettings() {
  const { beatmapRenderSettingsStore } = useCommonManagers();
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

function AnalysisCursorSettingsSection() {
  const { analysisCursorSettingsStore } = useCommonManagers();
  const settings = useObservable(() => analysisCursorSettingsStore.settings$, DEFAULT_ANALYSIS_CURSOR_SETTINGS);

  return (
    <Paper sx={{ boxShadow: "none", p: 2 }}>
      <Stack gap={1}>
        <Typography variant={"h6"}>Analysis Cursor</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(event) => analysisCursorSettingsStore.setEnabled(event.target.checked)}
              />
            }
            label={"Enabled"}
          />
        </FormGroup>
      </Stack>
    </Paper>
  );
}

function ReplayCursorSettingsSection() {
  const { replayCursorSettingsStore } = useCommonManagers();
  const settings = useObservable(() => replayCursorSettingsStore.settings$, DEFAULT_REPLAY_CURSOR_SETTINGS);

  return (
    <Paper sx={{ boxShadow: "none", p: 2 }}>
      <Stack gap={1}>
        <Typography variant={"h6"}>Replay Cursor</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(event) =>
                  replayCursorSettingsStore.changeSettings((s) => (s.enabled = event.target.checked))
                }
              />
            }
            label={"Enabled"}
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            disabled={!settings.enabled}
            control={
              <Switch
                checked={settings.smoothCursorTrail}
                onChange={(event) =>
                  replayCursorSettingsStore.changeSettings((s) => (s.smoothCursorTrail = event.target.checked))
                }
              />
            }
            label={"Smooth Cursor Trail"}
          />
        </FormGroup>
        <Typography>Scale</Typography>
        <Slider
          value={Math.round(settings.scale * 100)}
          valueLabelFormat={formatToPercent}
          disabled={!settings.enabled}
          min={10}
          max={200}
          onChange={(_, v) => replayCursorSettingsStore.changeSettings((s) => (s.scale = (v as number) / 100))}
          valueLabelDisplay={"auto"}
        />
      </Stack>
    </Paper>
  );
}

function HitErrorBarSettingsSection() {
  const { hitErrorBarSettingsStore } = useCommonManagers();
  const settings = useObservable(() => hitErrorBarSettingsStore.settings$, DEFAULT_HIT_ERROR_BAR_SETTINGS);
  return (
    <Paper elevation={1} sx={{ boxShadow: "none", p: 2 }}>
      <Stack>
        {/*TODO: Enabled*/}
        <Typography>Hit Error Bar Scaling</Typography>
        <Slider
          value={Math.round(settings.scale * 100)}
          valueLabelFormat={formatToPercent}
          max={300}
          onChange={(_, v) => hitErrorBarSettingsStore.changeSettings((s) => (s.scale = (v as number) / 100))}
          valueLabelDisplay={"auto"}
        />
      </Stack>
    </Paper>
  );
}

function PlaybarSettingsSection() {
  const { playbarSettingsStore } = useCommonManagers();
  const settings = useObservable(() => playbarSettingsStore.settings$, DEFAULT_PLAY_BAR_SETTINGS);

  return (
    <Paper elevation={1} sx={{ boxShadow: "none", p: 2 }}>
      <Stack gap={1}>
        <Typography variant={"h6"}>Playbar</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.difficultyGraphEnabled}
                onChange={(event) =>
                  playbarSettingsStore.changeSettings((s) => (s.difficultyGraphEnabled = event.target.checked))
                }
              />
            }
            label={"Show difficulty graph"}
          />
        </FormGroup>
      </Stack>
    </Paper>
  );
}

function GeneralSettings() {
  return (
    <Stack p={2} gap={1}>
      <ReplayCursorSettingsSection />
      <AnalysisCursorSettingsSection />
      <HitErrorBarSettingsSection />
      <BeatmapBackgroundSettings />
      <PlaybarSettingsSection />
      <BeatmapRenderSettings />
    </Stack>
  );
}

function SkinsSettings() {
  // TODO: Button for synchronizing skin list again

  const theater = useCommonManagers();

  const { preferredSkinId } = useObservable(() => theater.skinSettingsStore.settings$, DEFAULT_SKIN_SETTINGS);
  const chosenSkinId = stringToSkinId(preferredSkinId);
  const skins = useObservable(() => theater.skinManager.skinList$, []);

  const skinOptions: SkinId[] = useMemo(
    () => [DEFAULT_OSU_SKIN_ID, DEFAULT_REWIND_SKIN_ID].concat(skins.map((name) => ({ source: "osu", name }))),
    [skins],
  );

  useEffect(() => {
    theater.skinManager.loadSkinList();
  }, [theater]);

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
      // TODO: Error handling
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
