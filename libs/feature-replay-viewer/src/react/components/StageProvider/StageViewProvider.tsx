import { createContext, ReactNode, useContext, useEffect } from "react";
import { StageViewSettingsService } from "../../../../../web-player/rewind/src/settings/StageViewSettingsService";
import { ViewSettings } from "../../../../../web-player/rewind/src/model/ViewSettings";
import { useImmer } from "use-immer";

function useStageView(viewService: StageViewSettingsService) {
  const [viewSettings, updateViewSettings] = useImmer<ViewSettings>(() => {
    return viewService.getView();
  });

  // Making sure that the stage also gets the viewSettings synchronized on change.
  useEffect(() => {
    if (viewSettings !== viewService.getView()) viewService.changeView(viewSettings);
  }, [viewSettings]);

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
  viewService: StageViewSettingsService;
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
