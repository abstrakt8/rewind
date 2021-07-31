import React, { useCallback, useEffect, useRef, useState } from "react";
import modHidden from "../../assets/mod_hidden.cfc32448.png";
import styled from "styled-components";
import Playbar from "./playbar";
import { useInterval } from "../utils/useInterval";
import { formatReplayTime } from "../utils/time";
import { ReplayViewerApp } from "../app/ReplayViewerApp";
import { usePerformanceMonitor } from "../utils/usePerformanceMonitor";
import { useMobXContext } from "../contexts/MobXContext";
import { observer } from "mobx-react-lite";
import { autorun, toJS } from "mobx";
import { useHotkeys } from "react-hotkeys-hook";

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

const EfficientPlaybar = () => {
  const { gameClock, currentTime } = useGameClock();
  const loadedPercentage = currentTime / maxTime;
  const handleSeekTo = useCallback(
    (percentage) => {
      const t = percentage * maxTime;
      gameClock.seekTo(t);
    },
    [maxTime, gameClock],
  );
  return <Playbar loadedPercentage={loadedPercentage} onClick={handleSeekTo} />;
};

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

const speedsAllowed = [0.01, 0.25, 0.5, 1.0, 1.5, 2.0];
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

export const FeatureReplayViewer = observer((props: FeatureReplayViewerProps) => {
  // Times
  // const { isPlaying, toggleIsPlaying } = useGameClock();

  // const isPlaying = true;
  // const toggleIsPlaying = () => {};
  // const [timeHMS, timeMS] = formatReplayTime(currentTime, true).split(".");
  const maxTimeHMS = formatReplayTime(maxTime);
  // Canvas / Game
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const gameApp = useRef<ReplayViewerApp | null>(null);
  const performanceMonitor = usePerformanceMonitor({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scenario, renderSettings, gameClock } = useMobXContext();

  useShortcuts();
  //
  useEffect(() => {
    if (canvas.current) {
      gameApp.current = new ReplayViewerApp({
        clock: gameClock,
        view: canvas.current,
        performanceMonitor,
      });
      autorun(() => {
        if (gameApp.current) {
          gameApp.current.context.view = toJS(renderSettings.viewSettings);
          gameApp.current.context.skin = toJS(renderSettings.skin);
        }
      });
      autorun(() => {
        const a = gameApp.current;
        if (a) {
          console.log("Updating the app");
          // Basically toJS gives a deep clone without observations

          a.context.replay = toJS(scenario.replay);
          a.context.hitObjects = toJS(scenario.beatmap?.hitObjects ?? []);
          // TODO: This should not be observable
          a.context.replayTimeMachine = toJS(scenario.replayStateTimeMachine);
        }
      });
    }
    if (containerRef.current) {
      containerRef.current?.appendChild(performanceMonitor.dom);
    }
  }, [canvas, scenario, renderSettings, containerRef, gameApp, gameClock, performanceMonitor]);
  const toggleGameClock = useCallback(() => {
    if (gameClock.isPlaying) gameClock.pause();
    else gameClock.start();
  }, [gameClock, gameClock.isPlaying]);

  return (
    <div className={"flex flex-row bg-gray-800 text-gray-200 h-screen p-4 gap-4"}>
      <div className={"flex flex-col gap-4 flex-1 h-full"}>
        <div className={"flex-1 overflow-auto rounded relative"} ref={containerRef}>
          <canvas className={"w-full h-full bg-black"} ref={canvas} />
        </div>
        <div className={"flex flex-row gap-4 flex-none bg-gray-700 p-4 rounded align-middle"}>
          <button className={"transition-colors hover:text-gray-400"} onClick={toggleGameClock}>
            {gameClock.isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <CurrentTime />
          <div className={"flex-1"}>
            <EfficientPlaybar />
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
          <SettingsTitle title={"replay analysis"} />
          <ReplaySettingsBox>
            <div>Analysis cursor</div>
            <input type={"checkbox"} />
            <div>Draw misses</div>
            <input type={"checkbox"} />
            <div>Draw 50s</div>
            <input type={"checkbox"} />
            <div>Draw Sliderbreaks</div>
            <input type={"checkbox"} />
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
        <SidebarBox>Hmm</SidebarBox>
      </div>
    </div>
  );
});

export default FeatureReplayViewer;
