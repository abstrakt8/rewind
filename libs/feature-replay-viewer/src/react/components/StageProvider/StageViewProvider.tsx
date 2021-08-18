import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { StageViewService } from "../../../app/stage/rewind/StageViewService";
import produce from "immer";
import { WritableDraft } from "immer/dist/types/types-external";
import { ViewSettings } from "../../../game/ViewSettings";

function useStageView(viewService: StageViewService) {
  const [viewSettings, setViewSettings] = useState(viewService.getView());

  const changeViewSettings = (recipe: (x: WritableDraft<ViewSettings>) => any) => {
    setViewSettings((v) => produce(v, recipe));
  };
  const modHidden = viewSettings.modHidden;
  const toggleModHidden = useCallback(
    () =>
      changeViewSettings((draft) => {
        draft.modHidden = !draft.modHidden;
      }),
    [],
  );

  useEffect(() => {
    viewService.changeView(viewSettings);
  }, [viewService, viewSettings]);

  return {
    modHidden,
    toggleModHidden,
  };
}

interface StageViewProviderProps {
  viewService: StageViewService;
  children: ReactNode;
}

const StageViewContext = createContext<ReturnType<typeof useStageView>>(null!);

export function StageViewProvider({ viewService, children }: StageViewProviderProps) {
  const value = useStageView(viewService);
  return <StageViewContext.Provider value={value}>{children}</StageViewContext.Provider>;
}

export function useStageViewContext() {
  const context = useContext(StageViewContext);
  if (!context) {
    throw Error("useStageViewContext can only be used within a StageViewProvider");
  }
  return context;
}
