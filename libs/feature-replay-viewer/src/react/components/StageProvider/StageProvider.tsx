import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { RewindStage } from "../../../../../web-player/rewind/src/createRewindStage";
import { GameClockProvider } from "./StageClockProvider";
import { StageViewProvider } from "./StageViewProvider";
import { StagePlaybarSettingsProvider } from "./StagePlaybarSettingsProvider";
import {
  AudioSettings,
  AudioSettingsService,
} from "../../../../../web-player/rewind/src/settings/AudioSettingsService";
import { makeAutoObservable } from "mobx";

interface IStage {
  stage: RewindStage;
  audioSettings: AudioSettingsStore;
}

interface StageProviderProps {
  stage: RewindStage;
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const StageContext = createContext<IStage>(null!);

class AudioSettingsStore {
  audioSettings: AudioSettings;

  constructor(private readonly audioSettingsService: AudioSettingsService) {
    makeAutoObservable(this);
    this.audioSettings = audioSettingsService.settings;
    // Maybe observe on event?
  }

  get muted() {
    return this.audioSettings.muted;
  }

  get masterVolume() {
    return this.audioSettings.volume.master;
  }

  get musicVolume() {
    return this.audioSettings.volume.music;
  }

  get effectsVolume() {
    return this.audioSettings.volume.effects;
  }

  toggleMuted() {
    this.applyNewSettings({ ...this.audioSettings, muted: !this.audioSettings.muted });
  }

  applyNewSettings(audioSettings: AudioSettings) {
    this.audioSettingsService.applyNewSettings(audioSettings);
    this.audioSettings = this.audioSettingsService.settings;
  }
}

export function StageProvider({ stage, children }: StageProviderProps) {
  const audioSettings = useMemo(() => new AudioSettingsStore(stage.audioSettingsService), [stage]);
  return (
    <StageContext.Provider value={{ stage, audioSettings }}>
      <GameClockProvider clock={stage.clock}>
        <StageViewProvider viewService={stage.stageViewService}>
          <StagePlaybarSettingsProvider>{children}</StagePlaybarSettingsProvider>
        </StageViewProvider>
      </GameClockProvider>
    </StageContext.Provider>
  );
}

export function useStageContext() {
  const context = useContext(StageContext);
  if (!context) {
    throw Error("useStageContext must be provided within a StageProvider");
  }
  return context;
}
