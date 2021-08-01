import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import modHidden from "../../assets/mod_hidden.cfc32448.png";
import styled from "styled-components";
import Playbar, { PlaybarEvent } from "./playbar";
import { useInterval } from "../utils/useInterval";
import { formatReplayTime } from "../utils/time";
import { ReplayViewerApp } from "../app/ReplayViewerApp";
import { usePerformanceMonitor } from "../utils/usePerformanceMonitor";
import { useMobXContext } from "../contexts/MobXContext";
import { observer } from "mobx-react-lite";
import { autorun, toJS } from "mobx";
import { useHotkeys } from "react-hotkeys-hook";
import { ReplayAnalysisEvent, ReplayAnalysisEventType } from "@rewind/osu/core";
import { Switch } from "@headlessui/react";

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
const ReplaySettingsBox = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
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

const useGameClock = () => {
  const { gameClock } = useMobXContext();
  const [currentTime, setCurrentTime] = useState(0);

  // When I originally implemented this with an update of every 16ms I get FPS drops on the canvas. It does look smoother
  // though.
  useInterval(() => {
    setCurrentTime(gameClock.getCurrentTime());
  }, 128);

  return { gameClock, currentTime };
};

const maxTime = 20 * 60 * 1000;
const PlaybarColors = {
  MISS: "#ff0000",
  SLIDER_BREAK: "hsl(351,100%,70%)",
  OK: "#00ff00",
  MEH: "#ffa500",
};

type pbSettingType = "showMisses" | "showSliderBreaks" | "show100s" | "show50s";

type PlaybarSettings = Record<pbSettingType, boolean>;
// interface PlaybarSettings {
//   showMisses: boolean;
//   showSliderBreaks: boolean;
//   show100s: boolean;
//   show50s: boolean;
// }

function mapToPlaybarEvents(replayEvents: ReplayAnalysisEvent[], settings: PlaybarSettings): PlaybarEvent[] {
  const { showSliderBreaks, show100s, show50s, showMisses } = settings;
  const events: PlaybarEvent[] = [];
  replayEvents.forEach((e) => {
    const position = e.time / maxTime;
    switch (e.type) {
      case ReplayAnalysisEventType.MISS:
        if (showMisses) events.push({ color: PlaybarColors.MISS, position });
        break;
      case ReplayAnalysisEventType.MEH:
        if (show50s) events.push({ color: PlaybarColors.MEH, position });
        break;
      case ReplayAnalysisEventType.OK:
        if (show100s) events.push({ color: PlaybarColors.OK, position });
        break;
      case ReplayAnalysisEventType.SLIDER_INNER_CHECKPOINT_MISS:
      case ReplayAnalysisEventType.SLIDER_HEAD_MISS:
        if (showSliderBreaks) events.push({ color: PlaybarColors.SLIDER_BREAK, position });
        break;
    }
  });
  return events;
}

const EfficientPlaybar = observer((props: { settings: PlaybarSettings }) => {
  const { settings } = props;
  const { gameClock, currentTime } = useGameClock();
  const { scenario } = useMobXContext();
  const loadedPercentage = currentTime / maxTime;
  const handleSeekTo = useCallback(
    (percentage) => {
      const t = percentage * maxTime;
      gameClock.seekTo(t);
    },
    [maxTime, gameClock],
  );
  const events = useMemo(() => mapToPlaybarEvents(scenario.replayEvents, settings), [settings, scenario.replayEvents]);
  return <Playbar loadedPercentage={loadedPercentage} onClick={handleSeekTo} events={events} />;
});

export const CurrentTime = () => {
  const { currentTime } = useGameClock();
  const [timeHMS, timeMS] = formatReplayTime(currentTime, true).split(".");

  return (
    <span className={"self-center select-all"}>
      <span className={""}>{timeHMS}</span>
      <span className={"text-gray-500 text-xs"}>.{timeMS}</span>
    </span>
  );
};

const speedsAllowed = [0.01, 0.5, 1.0, 1.5, 2.0];
// TODO: FLOATING POINT EQUALITY ALERT
const speedIndex = (speed: number) => speedsAllowed.indexOf(speed);
const nextSpeed = (speed: number) => speedsAllowed[Math.min(speedsAllowed.length - 1, speedIndex(speed) + 1)];
const prevSpeed = (speed: number) => speedsAllowed[Math.max(0, speedIndex(speed) - 1)];

export const useShortcuts = () => {
  const { gameClock, renderSettings } = useMobXContext();
  // https://github.com/jaywcjlove/hotkeys/#defining-shortcuts
  useHotkeys("w", () => gameClock.setSpeed(nextSpeed(gameClock.playbackRate)));
  useHotkeys("s", () => gameClock.setSpeed(prevSpeed(gameClock.playbackRate)));
  useHotkeys("space", () => gameClock.togglePlaying());
  useHotkeys("d", () => gameClock.seekTo(Math.min(maxTime, gameClock.getCurrentTime() + 16)));
  useHotkeys("a", () => gameClock.seekTo(Math.max(0, gameClock.getCurrentTime() - 16)));
  useHotkeys("f", () => renderSettings.toggleModHidden());
};

function MyToggle(props: { enabled: boolean; setEnabled: (b: boolean) => unknown; color?: string }) {
  const { enabled, setEnabled, color } = props;

  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11`}
      style={{ backgroundColor: enabled ? color ?? "blue" : "#dddddd" }}
    >
      <span
        className={`${
          enabled ? "translate-x-6" : "translate-x-1"
        } inline-block w-4 h-4 transform bg-white rounded-full`}
      />
    </Switch>
  );
}

export const FeatureReplayViewer = observer((props: FeatureReplayViewerProps) => {
  const maxTimeHMS = formatReplayTime(maxTime);
  // Canvas / Game
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const gameApp = useRef<ReplayViewerApp | null>(null);
  const performanceMonitor = usePerformanceMonitor({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scenario, renderSettings, gameClock } = useMobXContext();
  const [pbSetting, setPbSetting] = useState<PlaybarSettings>({
    show50s: false,
    show100s: false,
    showMisses: true,
    showSliderBreaks: true,
  });

  useShortcuts();
  //
  useEffect(() => {
    if (canvas.current) {
      gameApp.current = new ReplayViewerApp({
        clock: gameClock,
        view: canvas.current,
        performanceMonitor,
        context: scenario.replayViewerContext,
      });
    }
    if (containerRef.current) {
      containerRef.current?.appendChild(performanceMonitor.dom);
    }
  }, [canvas, scenario, renderSettings, containerRef, gameApp, gameClock, performanceMonitor]);

  const handleTogglePbSetting = (who: pbSettingType) => (value: boolean) =>
    setPbSetting((prevState) => ({ ...prevState, [who]: value }));

  return (
    <div className={"flex flex-row bg-gray-800 text-gray-200 h-screen p-4 gap-4"}>
      <div className={"flex flex-col gap-4 flex-1 h-full"}>
        <div className={"flex-1 overflow-auto rounded relative"} ref={containerRef}>
          <canvas className={"w-full h-full bg-black"} ref={canvas} />
        </div>
        <div className={"flex flex-row gap-4 flex-none bg-gray-700 p-4 rounded align-middle"}>
          <button
            className={"transition-colors hover:text-gray-400"}
            tabIndex={-1}
            onClick={() => gameClock.togglePlaying()}
          >
            {gameClock.isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <CurrentTime />
          <div className={"flex-1"}>
            <EfficientPlaybar settings={pbSetting} />
          </div>
          <span className={"self-center select-all"}>{maxTimeHMS}</span>
          <button className={"w-10 -mb-1"} onClick={() => renderSettings.toggleModHidden()}>
            <img
              src={modHidden}
              alt={"ModHidden"}
              className={`filter ${renderSettings.viewSettings.modHidden ? "grayscale-0" : "grayscale"} `}
            />
          </button>
          <button className={"transition-colors hover:text-gray-400 text-lg bg-500"}>{gameClock.playbackRate}x</button>
        </div>
      </div>
      <div className={"flex flex-col gap-4 flex-none w-52 h-full overflow-y-auto"}>
        <SidebarBox>
          <SettingsTitle title={"Playbar Events"} />
          <PlaybarEventsBox>
            {/*TODO: Colors should correspond to the events */}
            <div>Misses</div>
            <MyToggle
              enabled={pbSetting["showMisses"]}
              setEnabled={handleTogglePbSetting("showMisses")}
              color={PlaybarColors.MISS}
            />
            <div>Slider breaks</div>
            <MyToggle
              enabled={pbSetting["showSliderBreaks"]}
              setEnabled={handleTogglePbSetting("showSliderBreaks")}
              color={PlaybarColors.SLIDER_BREAK}
            />
            <div>50s</div>
            <MyToggle
              enabled={pbSetting["show50s"]}
              setEnabled={handleTogglePbSetting("show50s")}
              color={PlaybarColors.MEH}
            />
            <div>100s</div>
            <MyToggle
              enabled={pbSetting["show100s"]}
              setEnabled={handleTogglePbSetting("show100s")}
              color={PlaybarColors.OK}
            />
          </PlaybarEventsBox>
        </SidebarBox>
        <SidebarBox>
          <SettingsTitle title={"replay analysis"} />
          <ReplaySettingsBox>
            <div>Analysis cursor</div>
            <MyToggle enabled={false} setEnabled={() => {}} />
            {/*<input type={"checkbox"} />*/}
            {/*<div>*/}
            {/*  Draw misses <input type={"checkbox"} />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*  Draw 50s <input type={"checkbox"} />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*  Draw 100s <input type={"checkbox"} />*/}
            {/*</div>*/}
          </ReplaySettingsBox>
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
        <SidebarBox>{scenario.state}</SidebarBox>
      </div>
    </div>
  );
});

export default FeatureReplayViewer;
