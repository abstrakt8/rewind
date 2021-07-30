import React, { useCallback, useEffect, useRef, useState } from "react";
import modHidden from "../../assets/mod_hidden.cfc32448.png";
import * as PIXI from "pixi.js";
import styled from "styled-components";
import Playbar from "./playbar";
import { PerformanceGameClock } from "../clocks/PerformanceGameClock";
import { useInterval } from "../utils/useInterval";
import { formatReplayTime } from "../utils/time";
import { ReplayViewerApp } from "../app/ReplayViewerApp";
import { usePerformanceMonitor } from "../utils/usePerformanceMonitor";
import { DEFAULT_VIEW_SETTINGS, ViewSettings } from "../ViewSettings";
import { OsuExpressManagers, useOsuExpressManagers } from "../contexts/OsuExpressContext";

/* eslint-disable-next-line */
export interface FeatureReplayViewerProps {
  bluePrintId: string;
  replayId?: string;
  skinId: string;
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
  const gameClock = useRef(new PerformanceGameClock());
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const toggleIsPlaying = useCallback(() => {
    if (gameClock.current.isPlaying) gameClock.current.pause();
    else gameClock.current.start();
  }, []);
  useEffect(() => {
    gameClock.current.start();
  }, []);
  useInterval(() => {
    setCurrentTime(gameClock.current.getCurrentTime());
    setIsPlaying(gameClock.current.isPlaying);
  }, 16);

  return { gameClock, currentTime, isPlaying, toggleIsPlaying };
};

const useLocalSettings = () => {
  const [settings, setSettings] = useState<ViewSettings>(DEFAULT_VIEW_SETTINGS);

  // const [modHiddenEnabled, setModHiddenEnabled] = useState(true);

  return {
    settings,
    toggleHidden: () => setSettings((prevState) => ({ ...prevState, modHidden: !prevState.modHidden })),
  };
};

export function FeatureReplayViewer(props: FeatureReplayViewerProps) {
  const { bluePrintId, replayId, skinId } = props;
  // Times
  const { gameClock, currentTime, isPlaying, toggleIsPlaying } = useGameClock();
  const [timeHMS, timeMS] = formatReplayTime(currentTime, true).split(".");
  const maxTime = 5 * 60 * 1000;
  const maxTimeHMS = formatReplayTime(maxTime);
  const loadedPercentage = currentTime / maxTime;
  // Canvas / Game
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const gameApp = useRef<ReplayViewerApp | null>(null);
  const performanceMonitor = usePerformanceMonitor({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { settings, toggleHidden } = useLocalSettings();
  const managers = useOsuExpressManagers();
  const { blueprintManager, replayManager, skinManager } = managers as OsuExpressManagers;

  useEffect(() => {
    if (!gameApp.current || !skinId) return;
    (async function () {
      const skin = await skinManager.loadSkin(skinId);
      gameApp.current?.applySkin(skin);
    })();
  }, [skinId, gameApp, skinManager]);

  useEffect(() => {
    gameApp.current?.applySettings(settings);
  }, [gameApp, settings]);

  useEffect(() => {
    if (canvas.current) {
      const app = new PIXI.Application({ view: canvas.current, antialias: true });
      gameApp.current = new ReplayViewerApp({ clock: gameClock.current, app, performanceMonitor });
    }
    if (containerRef.current) {
      containerRef.current?.appendChild(performanceMonitor.dom);
    }
  }, [gameClock, containerRef, gameApp, canvas, performanceMonitor]);

  useEffect(() => {
    if (!bluePrintId || !gameApp.current) {
      return;
    }
    (async function () {
      console.log(`Loading beatmapId=${bluePrintId}`);
      const beatmap = await blueprintManager.loadBlueprint(bluePrintId);
      gameApp.current?.applyBeatmapScenario(beatmap, []);
      gameApp.current?.initializeTicker();
    })();
  }, [bluePrintId, gameApp, blueprintManager]);

  const handleSeekTo = useCallback(
    (percentage) => {
      const t = percentage * maxTime;
      gameClock.current.seekTo(t);
    },
    [maxTime, gameClock],
  );

  return (
    <div className={"flex flex-row bg-gray-800 text-gray-200 h-screen p-4 gap-4"}>
      <div className={"flex flex-col gap-4 flex-1 h-full"}>
        <div className={"flex-1 overflow-auto rounded relative"} ref={containerRef}>
          <canvas className={"w-full h-full bg-black"} ref={canvas} />
        </div>
        <div className={"flex flex-row gap-4 flex-none bg-gray-700  p-4 rounded align-middle"}>
          <button className={"transition-colors hover:text-gray-400"} onClick={toggleIsPlaying}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className={"self-center select-all"}>
            <span className={""}>{timeHMS}</span>
            <span className={"text-gray-500 text-xs"}>.{timeMS}</span>
          </span>
          <div className={"flex-1"}>
            <Playbar loadedPercentage={loadedPercentage} onClick={handleSeekTo} />
          </div>
          <span className={"self-center select-all"}>{maxTimeHMS}</span>
          <button className={"w-10 -mb-1"} onClick={toggleHidden}>
            <img
              src={modHidden}
              alt={"ModHidden"}
              className={`filter ${settings.modHidden ? "grayscale-0" : "grayscale"} `}
            />
          </button>
          <button className={"transition-colors hover:text-gray-400 text-lg bg-500"}>1x</button>
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
      </div>
    </div>
  );
}

export default FeatureReplayViewer;
