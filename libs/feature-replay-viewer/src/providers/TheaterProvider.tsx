import React, { createContext, useContext, useEffect, useState } from "react";
import { createRewindTheater } from "@rewind/web-player/rewind";

type ITheaterContext = ReturnType<typeof createRewindTheater>;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const TheaterContext = createContext<ITheaterContext>(null!);

interface TheaterProviderProps {
  apiUrl: string;
  children: React.ReactNode;
}

export function TheaterProvider({ apiUrl, children }: TheaterProviderProps) {
  const [rewind] = useState(() => createRewindTheater({ apiUrl }));
  useEffect(() => {
    rewind.analyzer.initialize();
  }, [rewind]);
  return <TheaterContext.Provider value={rewind}>{children}</TheaterContext.Provider>;
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
  const { analyzer } = useTheaterContext();
  return analyzer;
}
