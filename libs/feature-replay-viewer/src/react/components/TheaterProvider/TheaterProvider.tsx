import React, { createContext, useContext, useState } from "react";
import { AnalysisApp, createRewindTheater } from "@rewind/web-player/rewind";

interface ITheaterContext {
  theater: ReturnType<typeof createRewindTheater>;
  analysis: AnalysisApp;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const TheaterContext = createContext<ITheaterContext>(null!);

interface TheaterProviderProps {
  apiUrl: string;
  children: React.ReactNode;
}

export function TheaterProvider({ apiUrl, children }: TheaterProviderProps) {
  const [theater] = useState(() => createRewindTheater({ apiUrl }));
  const [analysis] = useState(() => theater.createAnalysisApp());
  return <TheaterContext.Provider value={{ theater, analysis }}>{children}</TheaterContext.Provider>;
}

export function useTheaterContext() {
  const context = useContext(TheaterContext);
  if (!context) {
    throw Error("useTheaterContext can only be used within a TheaterProvider");
  }
  return context;
}

export function useTheater() {
  const { theater } = useTheaterContext();
  return theater;
}

export function useAnalysisApp() {
  const { analysis } = useTheaterContext();
  return analysis;
}
