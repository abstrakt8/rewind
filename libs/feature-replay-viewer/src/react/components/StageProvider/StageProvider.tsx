import { createContext, ReactNode, useContext } from "react";
import { RewindStage } from "../../../app/stage";

interface IStage {
  stage: RewindStage;
}

interface StageProviderProps {
  stage: RewindStage;
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const StageContext = createContext<IStage>(null!);

export function StageProvider({ stage, children }: StageProviderProps) {
  return <StageContext.Provider value={{ stage }}>{children}</StageContext.Provider>;
}

export function useStageContext() {
  const context = useContext(StageContext);
  if (!context) {
    throw Error("useStageContext must be provided within a StageProvider");
  }
  return context;
}
