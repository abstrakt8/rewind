import { useAnalysisApp } from "./react/components/TheaterProvider/TheaterProvider";
import React, { useEffect, useState } from "react";
import GameStage from "./react/GameStage";

interface Scenario {
  blueprintId?: string;
  replayId?: string;
  otherReplayIds?: string[];
}

interface Props {
  scenario: Scenario;
}

export function Canvas() {
  return <div>test</div>;
}

export function AnalysisAppPage(props: Props) {
  const { scenario } = props;
  const [loading, setLoading] = useState(false);

  const analysisApp = useAnalysisApp();

  useEffect(() => {
    (async function () {
      setLoading(true);
      if (scenario.replayId) {
        await analysisApp.loadReplay(scenario.replayId);
      } else if (scenario.blueprintId) {
        await analysisApp.loadBeatmap(scenario.blueprintId);
      }
      setLoading(false);
    })();
  }, [analysisApp, scenario]);

  return <GameStage />;
}
