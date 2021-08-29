import { createContext, ReactNode, useContext, useState } from "react";
import { PlaybarSettings } from "../../../theater/playbarSettings";

function useStagePlaybarSettings() {
  const [playbarSettings, setPlaybarSettings] = useState<PlaybarSettings>({
    showMisses: true,
    show100s: false,
    show50s: false,
    showSliderBreaks: true,
  });

  return {
    playbarSettings,
    setPlaybarSettings,
  };
}

interface StagePlaybarSettingsProviderProps {
  // default ...
  children: ReactNode;
}

const StagePlaybarSettingsContext = createContext<ReturnType<typeof useStagePlaybarSettings>>(null!);

export function StagePlaybarSettingsProvider({ children }: StagePlaybarSettingsProviderProps) {
  const value = useStagePlaybarSettings();
  return <StagePlaybarSettingsContext.Provider value={value}>{children}</StagePlaybarSettingsContext.Provider>;
}

export function useStagePlaybarSettingsContext() {
  const context = useContext(StagePlaybarSettingsContext);
  if (!context) {
    throw Error("useStagePlaybarSettingsContext can only be used within a StagePlaybarSettingsProvider");
  }
  return context;
}
