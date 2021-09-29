import { Box, Paper, Stack, Typography } from "@mui/material";
import { Playbar } from "./playbar";
import { AudioSettings } from "./playbar/AudioSettings";

export function Analyzer() {
  return (
    <Box
      sx={{
        p: 2,
        flexGrow: 1,
        height: "100%",
      }}
    >
      <Stack direction={"row"} height={"100%"} gap={2}>
        <Stack flexGrow={1} gap={2}>
          <Box
            flexGrow={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            sx={{ bgcolor: "black", borderRadius: 2 }}
          >
            <Typography>Canvas placeholder</Typography>
          </Box>
          <Paper elevation={1} sx={{ boxShadow: "none" }}>
            <Playbar />
          </Paper>
        </Stack>
        {/*<RhsSidebar />*/}
      </Stack>
    </Box>
  );
}
