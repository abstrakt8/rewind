import React from "react";
import styled from "styled-components";
import { Toggle } from "./Toggle";
import { useStageViewContext } from "./components/StageProvider/StageViewProvider";
import { PlaybarColors } from "./PlaybarColors";
import { PlaybarSettings } from "../theater/playbarSettings";
import { useStagePlaybarSettingsContext } from "./components/StageProvider/StagePlaybarSettingsProvider";

function SettingsTitle(props: { title: string }) {
  return <h1 className={"uppercase text-gray-400 text-sm"}>{props.title}</h1>;
}

const ShortcutHelper = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-column-gap: 1em;
  grid-row-gap: 0.5em;
  align-items: center;
  justify-content: space-between;
`;
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

// TODO: Use @apply from tailwind ...
const SidebarBox = (props: { children: React.ReactNode }) => {
  return <div className={"bg-gray-700 rounded px-1 py-2 flex flex-col items-center gap-2 px-4"}>{props.children}</div>;
};

function BeatmapAnalysisBox() {
  const { modHidden, setModHidden, sliderAnalysisFlag, setSliderAnalysisFlag } = useStageViewContext();
  return (
    <SidebarBox>
      <SettingsTitle title={"beatmap analysis"} />
      <GenericToggleSettingsBox>
        <div>Hidden</div>
        <Toggle enabled={modHidden} setEnabled={setModHidden} />
        <div>Slider Debug</div>
        <Toggle enabled={sliderAnalysisFlag} setEnabled={setSliderAnalysisFlag} />
      </GenericToggleSettingsBox>
    </SidebarBox>
  );
}

function CheatSheetBox() {
  return (
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
  );
}

function ReplayAnalysisBox() {
  const { analysisCursorFlag, setAnalysisCursorFlag, osuCursorFlag, setOsuCursorFlag } = useStageViewContext();
  return (
    <SidebarBox>
      <SettingsTitle title={"replay analysis"} />
      <GenericToggleSettingsBox>
        <div>Normal Cursor</div>
        <Toggle enabled={osuCursorFlag} setEnabled={setOsuCursorFlag} />
        <div>Analysis Cursor</div>
        <Toggle enabled={analysisCursorFlag} setEnabled={setAnalysisCursorFlag} />
      </GenericToggleSettingsBox>
    </SidebarBox>
  );
}

function PlaybarSettingsBox() {
  // TODO: Don't use Redux
  const { playbarSettings: pbSetting, setPlaybarSettings } = useStagePlaybarSettingsContext();
  const handleTogglePbSetting = (s: keyof PlaybarSettings) => (value: boolean) =>
    setPlaybarSettings((pbSetting) => ({
      ...pbSetting,
      [s]: value,
    }));

  return (
    <SidebarBox>
      <SettingsTitle title={"Playbar Events"} />
      <PlaybarEventsBox>
        {/*TODO: Colors should correspond to the events */}
        <div>Misses</div>
        <Toggle
          enabled={pbSetting["showMisses"]}
          setEnabled={handleTogglePbSetting("showMisses")}
          color={PlaybarColors.MISS}
        />
        <div>Slider breaks</div>
        <Toggle
          enabled={pbSetting["showSliderBreaks"]}
          setEnabled={handleTogglePbSetting("showSliderBreaks")}
          color={PlaybarColors.SLIDER_BREAK}
        />
        <div>50s</div>
        <Toggle
          enabled={pbSetting["show50s"]}
          setEnabled={handleTogglePbSetting("show50s")}
          color={PlaybarColors.MEH}
        />
        <div>100s</div>
        <Toggle
          enabled={pbSetting["show100s"]}
          setEnabled={handleTogglePbSetting("show100s")}
          color={PlaybarColors.OK}
        />
      </PlaybarEventsBox>
    </SidebarBox>
  );
}

export function Sidebar() {
  return (
    <div className={"flex flex-col gap-4 flex-none w-52 h-full overflow-y-auto"}>
      <PlaybarSettingsBox />
      <BeatmapAnalysisBox />
      <ReplayAnalysisBox />
      <CheatSheetBox />
    </div>
  );
}
