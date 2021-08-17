import React, { createContext, useCallback, useContext, useState } from "react";
import { createRewindTheater, Theater } from "../../../app/theater";
import { RewindStage } from "../../../app/stage";

interface ITheaterContext {
  createStage: (blueprintId: string, replayId: string) => Promise<RewindStage>;
  isCreatingStage: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const TheaterContext = createContext<ITheaterContext>(null!);

interface TheaterProviderProps {
  apiUrl: string;
  children: React.ReactNode;
}

export function TheaterProvider({ apiUrl, children }: TheaterProviderProps) {
  const [theater] = useState(createRewindTheater({ apiUrl }));
  const [isCreatingStage, setIsCreatingStage] = useState(false);

  const createStage = useCallback(
    (blueprintId: string, replayId: string) => {
      setIsCreatingStage(true);
      return theater.createStage(blueprintId, replayId).then((stage) => {
        setIsCreatingStage(false);
        return stage;
      });
    },
    [theater],
  );

  return (
    <TheaterContext.Provider
      value={{
        createStage,
        isCreatingStage,
      }}
    >
      {children}
    </TheaterContext.Provider>
  );
}

export function useTheaterContext() {
  const context = useContext(TheaterContext);
  if (!context) {
    throw Error("useTheaterContext can only be used within a TheaterProvider");
  }
  return context;
}
