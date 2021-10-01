import { Box } from "@mui/material";
import { Analyzer } from "@rewind/feature-replay-viewer";
import { useAnalysisApp, useTheater } from "@rewind/feature-replay-viewer";
import { useEffect } from "react";
import { DEFAULT_SKIN_ID } from "../../../../libs/web-player/rewind/src/model/SkinId";

const akatsukiId = "535c6e5b4febb48629cbdd4e3a268624";
const akatsukiReplayId = "exported:RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";

const chosenBlueprintId = akatsukiId;
const chosenReplayId = akatsukiReplayId;
const skin = DEFAULT_SKIN_ID;

export function WebTestApp() {
  const theater = useTheater();
  const analyzer = useAnalysisApp();
  useEffect(() => {
    theater.changeSkin(skin);

    analyzer.loadReplay(chosenReplayId);
  }, []);
  return (
    <Box sx={{ height: "100vh" }}>
      <Analyzer />
    </Box>
  );
}
