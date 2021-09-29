import { Box, Slider, Stack, Tooltip, Typography } from "@mui/material";
import { VolumeDown, VolumeUp } from "@mui/icons-material";

export function VolumeSlider({ disabled }: { disabled?: boolean }) {
  return (
    <Stack gap={2} direction={"row"}>
      <VolumeDown />
      <Slider size="small" defaultValue={30} aria-label="Small" valueLabelDisplay="auto" disabled={disabled} />
      <VolumeUp />
    </Stack>
  );
}

export function AudioSettings() {
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
        <VolumeSlider />
      </Box>

      <Box>
        <Typography id="input-slider" gutterBottom>
          Music Volume
        </Typography>
        <VolumeSlider />
      </Box>
      <Box>
        <Typography id="input-slider" gutterBottom>
          Effects Volume
        </Typography>
        <Tooltip title={"Hit sounds coming soon!"}>
          {/*https://mui.com/components/tooltips/#disabled-elements*/}
          <span>
            <VolumeSlider disabled={true} />
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}
