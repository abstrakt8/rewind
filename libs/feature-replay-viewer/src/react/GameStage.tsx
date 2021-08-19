import React, { useCallback, useMemo, useState } from "react";
import modHiddenImg from "../../assets/mod_hidden.cfc32448.png";
import Playbar, { PlaybarEvent } from "./Playbar";
import { formatReplayTime } from "../utils/time";
import { observer } from "mobx-react-lite";
import { ReplayAnalysisEvent } from "@rewind/osu/core";
import { useStageViewContext } from "./components/StageProvider/StageViewProvider";
import { GameCanvas } from "./GameCanvas";
import { useStageShortcuts } from "./hooks/useStageShortcuts";
import { useGameClockContext } from "./components/StageProvider/StageClockProvider";
import { Sidebar } from "./Sidebar";

/* eslint-disable-next-line */
export interface FeatureReplayViewerProps {
  // bluePrintId: string;
  // replayId?: string;
  // skinId: string;
  // replays: OsuReplay[];
}

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const PlaybarColors = {
  MISS: "#ff0000",
  SLIDER_BREAK: "hsl(351,100%,70%)",
  OK: "#00ff00",
  MEH: "#ffa500",
};

type PlaybarFilter = "showMisses" | "showSliderBreaks" | "show100s" | "show50s";

type PlaybarSettings = Record<PlaybarFilter, boolean>;

function mapToPlaybarEvents(
  replayEvents: ReplayAnalysisEvent[],
  settings: PlaybarSettings,
  maxTime: number,
): PlaybarEvent[] {
  const { showSliderBreaks, show100s, show50s, showMisses } = settings;
  const events: PlaybarEvent[] = [];
  console.log("Remapping???");
  // TODO: Refactor -> maybe filter afterwards
  replayEvents.forEach((e) => {
    const position = e.time / maxTime;
    switch (e.type) {
      case "HitObjectJudgement":
        // TODO: for lazer style, this needs some rework
        if (e.isSliderHead) {
          if (e.verdict === "MISS" && showSliderBreaks) events.push({ color: PlaybarColors.SLIDER_BREAK, position });
          return;
        } else {
          if (e.verdict === "MISS" && showMisses) events.push({ color: PlaybarColors.MISS, position });
          if (e.verdict === "MEH" && show50s) events.push({ color: PlaybarColors.MEH, position });
          if (e.verdict === "OK" && show100s) events.push({ color: PlaybarColors.OK, position });
        }
        // if(e.verdict === "GREAT" && show300s) events.push(); // Not sure if this will ever be implemented
        break;
      case "CheckpointJudgement":
        if (showSliderBreaks && !e.hit && !e.isLastTick) events.push({ color: PlaybarColors.SLIDER_BREAK, position });
        break;
      case "UnnecessaryClick":
        // TODO
        break;
    }
  });
  return events;
}

const EfficientPlaybar = observer((props: { settings: PlaybarSettings }) => {
  const { settings } = props;
  const { timeInMs: currentTime, durationInMs: maxTime, seekTo } = useGameClockContext();

  // const scenario = useCurrentScenario();
  const replayEvents: ReplayAnalysisEvent[] = useMemo(() => [], []);
  const loadedPercentage = currentTime / maxTime;
  const handleSeekTo = useCallback(
    (percentage) => {
      const t = percentage * maxTime;
      console.log(`Seeking to time=${t} `);
      seekTo(t);
    },
    [maxTime, seekTo],
  );
  const events = useMemo(() => mapToPlaybarEvents(replayEvents, settings, maxTime), [settings, replayEvents, maxTime]);
  return <Playbar loadedPercentage={loadedPercentage} onClick={handleSeekTo} events={events} />;
});

export const CurrentTime = () => {
  const { timeInMs: currentTime } = useGameClockContext();
  const [timeHMS, timeMS] = formatReplayTime(currentTime, true).split(".");

  return (
    <span className={"self-center select-all"}>
      <span className={""}>{timeHMS}</span>
      <span className={"text-gray-500 text-xs"}>.{timeMS}</span>
    </span>
  );
};

export const GameStage = (props: FeatureReplayViewerProps) => {
  // Canvas / Game
  //
  const [pbSetting, setPbSetting] = useState<PlaybarSettings>({
    show50s: false,
    show100s: false,
    showMisses: true,
    showSliderBreaks: true,
  });
  const handleTogglePbSetting = (who: PlaybarFilter) => (value: boolean) =>
    setPbSetting((prevState) => ({ ...prevState, [who]: value }));

  const { isPlaying, toggleClock, speed, durationInMs } = useGameClockContext();
  const maxTimeHMS = formatReplayTime(durationInMs);

  const handlePlayButtonClick = useCallback(() => toggleClock(), [toggleClock]);

  const { modHidden, toggleModHidden } = useStageViewContext();
  const handleHiddenButtonClicked = useCallback(() => toggleModHidden(), [toggleModHidden]);

  useStageShortcuts();

  return (
    <div className={"flex flex-row bg-gray-800 text-gray-200 h-screen p-4 gap-4"}>
      <div className={"flex flex-col gap-4 flex-1 h-full"}>
        {/*<div className={"flex-1 rounded relative"}>*/}
        {/*TODO: Very hacky*/}
        <GameCanvas />
        {/*</div>*/}
        <div className={"flex flex-row gap-4 flex-none bg-gray-700 p-4 rounded align-middle"}>
          <button className={"transition-colors hover:text-gray-400"} tabIndex={-1} onClick={handlePlayButtonClick}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <CurrentTime />
          <div className={"flex-1"}>
            <EfficientPlaybar settings={pbSetting} />
          </div>
          <span className={"self-center select-all"}>{maxTimeHMS}</span>
          <button className={"w-10 -mb-1"} onClick={handleHiddenButtonClicked}>
            <img
              src={modHiddenImg}
              alt={"ModHidden"}
              className={`filter ${modHidden ? "grayscale-0" : "grayscale"} `}
            />
          </button>
          <button className={"transition-colors hover:text-gray-400 text-lg bg-500"}>{speed}x</button>
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

export default GameStage;