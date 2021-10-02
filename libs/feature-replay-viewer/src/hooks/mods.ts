import { useAnalysisApp } from "../providers/TheaterProvider";
import { useObservable } from "rxjs-hooks";
import { useCallback } from "react";

export function useModControls() {
  const { modSettingsManager } = useAnalysisApp();

  const modSettings = useObservable(() => modSettingsManager.modSettings$, { flashlight: false, hidden: false });
  const setHidden = useCallback((value) => modSettingsManager.setHidden(value), [modSettingsManager]);

  return { ...modSettings, setHidden };
}
