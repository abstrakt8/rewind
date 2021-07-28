import React, { useState } from "react";
import { Playbar } from "@rewind/ui";
import modHidden from "../../assets/mod_hidden.cfc32448.png";
import styled from "styled-components";

/* eslint-disable-next-line */
export interface FeatureReplayViewerProps {}

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

export function FeatureReplayViewer(props: FeatureReplayViewerProps) {
  const [isPlaying, setPlaying] = useState(true);
  const [modHiddenEnabled, setModHiddenEnabled] = useState(true);

  return (
    <div className={"flex flex-row bg-gray-800 text-gray-200 h-screen p-4 gap-4"}>
      <div className={"flex flex-col gap-4 flex-1 h-full"}>
        <div className={"flex-1 overflow-auto rounded"}>
          <canvas className={"w-full h-full bg-black"} />
        </div>
        <div className={"flex flex-row gap-4 flex-none bg-gray-700  p-4 rounded align-middle"}>
          <button className={"transition-colors hover:text-gray-400"}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className={"self-center select-all"}>
            <span className={""}>2:03</span>
            <span className={"text-gray-500 text-xs"}>.027</span>
          </span>
          <div className={"flex-1"}>
            <Playbar></Playbar>
          </div>
          <span className={"self-center select-all"}>4:32</span>
          <button className={"w-10 -mb-1"} onClick={() => setModHiddenEnabled(!modHiddenEnabled)}>
            <img
              src={modHidden}
              alt={"ModHidden"}
              className={`filter ${modHiddenEnabled ? "grayscale-0" : "grayscale"} `}
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
