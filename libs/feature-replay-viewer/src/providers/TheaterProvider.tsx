import React, { createContext, useContext } from "react";
import { RewindTheater } from "@rewind/web-player/rewind";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const TheaterContext = createContext<RewindTheater>(null!);

interface TheaterProviderProps {
  theater: RewindTheater;
  children: React.ReactNode;
}

export function TheaterProvider({ theater, children }: TheaterProviderProps) {
  return <TheaterContext.Provider value={theater}>{children}</TheaterContext.Provider>;
}

export function useTheaterContext() {
  const context = useContext(TheaterContext);
  if (!context) {
    throw Error("useTheaterContext can only be used within a TheaterProvider");
  }
  return context;
}

export function useCommonManagers() {
  const theater = useTheaterContext();
  return theater.common;
}

export function useAnalysisApp() {
  const theater = useTheaterContext();
  return theater.analyzer;
}
