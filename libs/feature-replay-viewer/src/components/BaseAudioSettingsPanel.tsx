import { Box, Slider, Stack, Tooltip, Typography } from "@mui/material";
import { VolumeDown, VolumeUp } from "@mui/icons-material";

type Change = (x: number) => void;

interface BaseAudioSettingsPanelProps {
  master: number;
  effects: number;
  music: number;

  onMasterChange: Change;
  onEffectsChange: Change;
  onMusicChange: Change;
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
  const { master, effects, music, onMasterChange, onEffectsChange, onMusicChange } = props;
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
        <Tooltip title={"Hit sounds coming soon!"}>
          {/*https://mui.com/components/tooltips/#disabled-elements*/}
          <span>
            <VolumeSlider disabled={true} onChange={onEffectsChange} value={effects} />
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}
