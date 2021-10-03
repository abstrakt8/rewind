import { Box } from "@mui/material";
import { Analyzer } from "@rewind/feature-replay-viewer";
import { useAnalysisApp, useTheater } from "@rewind/feature-replay-viewer";
import { useEffect } from "react";
import { SkinId } from "@rewind/web-player/rewind";

const akatsukiId = "535c6e5b4febb48629cbdd4e3a268624";
const akatsukiReplayId = "exported:RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";
const tunaReplayId =
  "exported:FlyingTuna - sabi - true DJ MAG top ranker's song Zenpen (katagiri Remix) [KEMOMIMI EDM SQUAD] (2021-08-02) Osu.osr";

const chosenBlueprintId = akatsukiId;
const chosenReplayId = tunaReplayId;
// const skin = DEFAULT_SKIN_ID;
const skin: SkinId = { source: "osu", name: "-        # re;owoTuna v1.1 『Selyu』 #        -" };

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
