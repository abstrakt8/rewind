import { Box, FormControlLabel, Slider, Stack, Switch, Typography } from "@mui/material";
import { VolumeDown, VolumeUp } from "@mui/icons-material";

type Change = (x: number) => void;

interface BaseAudioSettingsPanelProps {
  master: number;
  effects: number;
  music: number;
  beatmapHitsounds: boolean;

  onMasterChange: Change;
  onEffectsChange: Change;
  onMusicChange: Change;
  onMutedChange: (muted: boolean) => unknown;
  onBeatmapHitsoundsChange: (enabled: boolean) => unknown;
}

export function VolumeSlider({ disabled, onChange, value }: { disabled?: boolean; onChange: Change; value: number }) {
  return (
    <Stack gap={2} direction={"row"}>
      <VolumeDown />
      <Slider
        size="small"
        valueLabelDisplay="auto"
        disabled={disabled}
        value={Math.floor(value * 100)}
        step={1}
        onChange={(_, x) => onChange((x as number) / 100)}
      />
      <VolumeUp />
    </Stack>
  );
}

export function BaseAudioSettingsPanel(props: BaseAudioSettingsPanelProps) {
  const {
    master,
    effects,
    music,
    beatmapHitsounds,
    onMasterChange,
    onEffectsChange,
    onMusicChange,
    onBeatmapHitsoundsChange,
  } = props;
  return (
    <Stack
      sx={{
        p: 2,
      }}
      gap={1}
    >
      <Box>
        <Typography id="input-slider" gutterBottom>
          Master Volume
        </Typography>
        <VolumeSlider onChange={onMasterChange} value={master} />
      </Box>

      <Box>
        <Typography id="input-slider" gutterBottom>
          Music Volume
        </Typography>
        <VolumeSlider onChange={onMusicChange} value={music} />
      </Box>
      <Box>
        <Typography id="input-slider" gutterBottom>
          Effects Volume
        </Typography>
        <VolumeSlider onChange={onEffectsChange} value={effects} />
      </Box>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={beatmapHitsounds}
            onChange={(e) => onBeatmapHitsoundsChange(e.target.checked)}
          />
        }
        label={<Typography variant="body2">Beatmap hitsounds</Typography>}
      />
    </Stack>
  );
}
