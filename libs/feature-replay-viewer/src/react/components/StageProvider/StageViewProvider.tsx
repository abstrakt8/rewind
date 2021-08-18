import { createContext, ReactNode, useCallback, useContext, useEffect } from "react";
import { StageViewService } from "../../../app/stage/rewind/StageViewService";
import { ViewSettings } from "../../../game/ViewSettings";
import { useImmer } from "use-immer";

function useStageView(viewService: StageViewService) {
  const [viewSettings, updateViewSettings] = useImmer<ViewSettings>(viewService.getView());

  // Making sure that the stage also gets the viewSettings synchronized on change.
  useEffect(() => {
    viewService.changeView(viewSettings);
  }, [viewService, viewSettings]);

  // ModHidden
  const modHidden = viewSettings.modHidden;
  const setModHidden = (value: boolean) =>
    updateViewSettings((draft) => {
      draft.modHidden = value;
    });
  const toggleModHidden = () =>
    updateViewSettings((draft) => {
      draft.modHidden = !draft.modHidden;
    });

  // SliderAnalysis
  const sliderAnalysisFlag = viewSettings.sliderAnalysis;
  const setSliderAnalysisFlag = (value: boolean) =>
    updateViewSettings((draft) => {
      draft.sliderAnalysis = value;
    });

  const osuCursorFlag = viewSettings.osuCursor.enabled;
  const setOsuCursorFlag = (value: boolean) =>
    updateViewSettings((draft) => {
      draft.osuCursor.enabled = value;
    });

  const analysisCursorFlag = viewSettings.analysisCursor.enabled;
  const setAnalysisCursorFlag = (value: boolean) =>
    updateViewSettings((draft) => {
      draft.analysisCursor.enabled = value;
    });

  return {
    modHidden,
    toggleModHidden,
    setModHidden,
    sliderAnalysisFlag,
    setSliderAnalysisFlag,
    osuCursorFlag,
    setOsuCursorFlag,
    analysisCursorFlag,
    setAnalysisCursorFlag,
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
