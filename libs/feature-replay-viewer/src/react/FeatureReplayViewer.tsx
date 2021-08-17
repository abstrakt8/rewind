import React, { useCallback, useMemo, useState } from "react";
import modHiddenImg from "../../assets/mod_hidden.cfc32448.png";
import styled from "styled-components";
import Playbar, { PlaybarEvent } from "./Playbar";
import { useInterval } from "./hooks/useInterval";
import { formatReplayTime } from "../utils/time";
import { observer } from "mobx-react-lite";
import { ReplayAnalysisEvent } from "@rewind/osu/core";
import { Switch } from "@headlessui/react";
import { useGameClock, useGameClockControls, usePartiallySyncedGameClockTime } from "./hooks/useGameClock";
import { useStageViewSettings } from "./hooks/useStageViewSettings";
import { GameCanvas } from "./GameCanvas";
import { useStageShortcuts } from "./hooks/useStageShortcuts";

/* eslint-disable-next-line */
export interface FeatureReplayViewerProps {
  // bluePrintId: string;
  // replayId?: string;
  // skinId: string;
  // replays: OsuReplay[];
}

function SettingsTitle(props: { title: string }) {
  return <h1 className={"uppercase text-gray-400 text-sm"}>{props.title}</h1>;
}

const PlaybarEventsBox = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-column-gap: 0.5em;
  grid-row-gap: 1em;
  align-items: center;
  justify-content: space-between;
`;

const GenericToggleSettingsBox = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-row-gap: 1em;
  grid-column-gap: 1em;
  align-items: center;
  justify-content: space-between;
`;

const ShortcutHelper = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-column-gap: 1em;
  grid-row-gap: 0.5em;
  align-items: center;
  justify-content: space-between;
`;

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
const SidebarBox = (props: { children: React.ReactNode }) => {
  return <div className={"bg-gray-700 rounded px-1 py-2 flex flex-col items-center gap-2 px-4"}>{props.children}</div>;
};

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
  const currentTime = usePartiallySyncedGameClockTime();
  const gameClock = useGameClock();
  const maxTime = gameClock.durationInMs;
  // const scenario = useCurrentScenario();
  const replayEvents: ReplayAnalysisEvent[] = [];
  const loadedPercentage = currentTime / maxTime;
  const handleSeekTo = useCallback(
    (percentage) => {
      const t = percentage * maxTime;
      console.log(`Seeking to time=${t} `);
      gameClock.seekTo(t);
    },
    [maxTime, gameClock],
  );
  const events = useMemo(() => mapToPlaybarEvents(replayEvents, settings, maxTime), [settings, replayEvents, maxTime]);
  return <Playbar loadedPercentage={loadedPercentage} onClick={handleSeekTo} events={events} />;
});

export const CurrentTime = () => {
  const currentTime = usePartiallySyncedGameClockTime();
  const [timeHMS, timeMS] = formatReplayTime(currentTime, true).split(".");

  return (
    <span className={"self-center select-all"}>
      <span className={""}>{timeHMS}</span>
      <span className={"text-gray-500 text-xs"}>.{timeMS}</span>
    </span>
  );
};

function MyToggle(props: { enabled: boolean; setEnabled: (b: boolean) => unknown; color?: string }) {
  const { enabled, setEnabled, color } = props;

  return (
    <Switch
      // doesn't really work
      tabIndex={-1}
      checked={enabled}
      onChange={setEnabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11`}
      style={{ backgroundColor: enabled ? color ?? "#4272b3" : "#dddddd" }}
    >
      <span
        className={`${
          enabled ? "translate-x-6" : "translate-x-1"
        } inline-block w-4 h-4 transform bg-white rounded-full`}
      />
    </Switch>
  );
}

export const FeatureReplayViewer = (props: FeatureReplayViewerProps) => {
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

  // const scenario = useCurrentScenario();
  // const { view, gameClock } = scenario;

  // const maxTimeHMS = formatReplayTime(gameClock.maxTime);
  // useShortcuts();

  const { isPlaying, toggleClock, speed, durationInMs } = useGameClockControls();
  const maxTimeHMS = formatReplayTime(durationInMs);

  // const currentPlaybackRate = useAppSelector((state) => state.gameClock.playbackRate);
  // const isPlaying = useAppSelector((state) => state.gameClock.playing);

  const handlePlayButtonClick = useCallback(() => toggleClock(), [toggleClock]);

  const { modHidden, toggleModHidden } = useStageViewSettings();
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
      <div className={"flex flex-col gap-4 flex-none w-52 h-full overflow-y-auto"}>
        {/*<SidebarBox>*/}
        {/*  <SettingsTitle title={"Playbar Events"} />*/}
        {/*  <PlaybarEventsBox>*/}
        {/*    /!*TODO: Colors should correspond to the events *!/*/}
        {/*    <div>Misses</div>*/}
        {/*    <MyToggle*/}
        {/*      enabled={pbSetting["showMisses"]}*/}
        {/*      setEnabled={handleTogglePbSetting("showMisses")}*/}
        {/*      color={PlaybarColors.MISS}*/}
        {/*    />*/}
        {/*    <div>Slider breaks</div>*/}
        {/*    <MyToggle*/}
        {/*      enabled={pbSetting["showSliderBreaks"]}*/}
        {/*      setEnabled={handleTogglePbSetting("showSliderBreaks")}*/}
        {/*      color={PlaybarColors.SLIDER_BREAK}*/}
        {/*    />*/}
        {/*    <div>50s</div>*/}
        {/*    <MyToggle*/}
        {/*      enabled={pbSetting["show50s"]}*/}
        {/*      setEnabled={handleTogglePbSetting("show50s")}*/}
        {/*      color={PlaybarColors.MEH}*/}
        {/*    />*/}
        {/*    <div>100s</div>*/}
        {/*    <MyToggle*/}
        {/*      enabled={pbSetting["show100s"]}*/}
        {/*      setEnabled={handleTogglePbSetting("show100s")}*/}
        {/*      color={PlaybarColors.OK}*/}
        {/*    />*/}
        {/*  </PlaybarEventsBox>*/}
        {/*</SidebarBox>*/}
        <SidebarBox>
          {/*<SettingsTitle title={"beatmap analysis"} />*/}
          {/*<GenericToggleSettingsBox>*/}
          {/*  <div>Hidden</div>*/}
          {/*  <MyToggle enabled={scenario.view.modHidden} setEnabled={() => scenario.toggleHidden()} />*/}
          {/*  <div>Slider Debug</div>*/}
          {/*  <MyToggle enabled={scenario.view.sliderAnalysis} setEnabled={() => scenario.toggleSliderAnalysis()} />*/}
          {/*</GenericToggleSettingsBox>*/}
        </SidebarBox>
        <SidebarBox>
          {/*<SettingsTitle title={"replay analysis"} />*/}
          {/*<GenericToggleSettingsBox>*/}
          {/*  <div>Normal Cursor</div>*/}
          {/*  <MyToggle enabled={scenario.view.osuCursor.enabled} setEnabled={() => scenario.toggleOsuCursor()} />*/}
          {/*  <div>Analysis Cursor</div>*/}
          {/*  <MyToggle*/}
          {/*    enabled={scenario.view.analysisCursor.enabled}*/}
          {/*    setEnabled={() => scenario.toggleAnalysisCursor()}*/}
          {/*  />*/}
          {/*</GenericToggleSettingsBox>*/}
        </SidebarBox>
        <SidebarBox>
          <SettingsTitle title={"shortcuts"} />
          <ShortcutHelper>
            <span>Start / Pause</span>
            <span className={"font-mono bg-gray-800 px-2"}>␣</span>
            <span>Previous frame</span>
            <span className={"font-mono bg-gray-800 px-2"}>a</span>
            <span>Next frame</span>
            <span className={"font-mono bg-gray-800 px-2"}>d</span>
            <span>Speed decrease</span>
            <span className={"font-mono bg-gray-800 px-2"}>s</span>
            <span>Speed increase</span>
            <span className={"font-mono bg-gray-800 px-2"}>w</span>
            <span>Toggle Hidden</span>
            <span className={"font-mono bg-gray-800 px-2"}>f</span>
          </ShortcutHelper>
        </SidebarBox>
        {/*<SidebarBox>{theater.state}</SidebarBox>*/}
      </div>
    </div>
  );
};

export default FeatureReplayViewer;
