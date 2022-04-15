import { Stack, Typography } from "@mui/material";
import { FastRewind } from "@mui/icons-material";

export const RewindLogo = () => (
  <Stack alignItems={"center"}>
    <FastRewind fontSize={"large"} />
    <Typography fontSize={"8px"} sx={{ userSelect: "none" }}>
      REWIND
    </Typography>
  </Stack>
);
