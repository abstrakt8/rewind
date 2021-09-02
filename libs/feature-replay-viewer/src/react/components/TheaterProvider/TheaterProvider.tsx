import React, { createContext, useContext, useMemo } from "react";
import { createRewindTheater, Theater } from "../../../app/theater/createRewindTheater";

interface ITheaterContext {
  theater: Theater;
  // createStage: (blueprintId: string, replayId: string) => Promise<RewindStage>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const TheaterContext = createContext<ITheaterContext>(null!);

interface TheaterProviderProps {
  apiUrl: string;
  children: React.ReactNode;
}

export function TheaterProvider({ apiUrl, children }: TheaterProviderProps) {
  const theater = useMemo(() => createRewindTheater({ apiUrl }), [apiUrl]);
  return <TheaterContext.Provider value={{ theater }}>{children}</TheaterContext.Provider>;
}

export function useTheaterContext() {
  const context = useContext(TheaterContext);
  if (!context) {
    throw Error("useTheaterContext can only be used within a TheaterProvider");
  }
  return context;
}
