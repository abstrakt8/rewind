import { Box } from "@mui/material";
import { Analyzer } from "../../../../libs/feature-replay-viewer/src/Analyzer";
import { useAnalysisApp } from "@rewind/feature-replay-viewer";
import { useEffect } from "react";

const akatsukiId = "535c6e5b4febb48629cbdd4e3a268624";
const akatsukiReplayId = "exported:RyuK - HoneyWorks - Akatsuki Zukuyo [Taeyang's Extra] (2019-06-08) Osu.osr";

const chosenBlueprintId = akatsukiId;
const chosenReplayId = akatsukiReplayId;

export function WebTestApp() {
  const analyzer = useAnalysisApp();
  useEffect(() => {
    analyzer.loadReplay(chosenReplayId);
  }, []);
  return (
    <Box sx={{ height: "100vh" }}>
      {/*hallo*/}
      <Analyzer />
    </Box>
  );
}
