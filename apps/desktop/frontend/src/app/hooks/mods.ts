import { useAnalysisApp } from "../providers/TheaterProvider";
import { useObservable } from "rxjs-hooks";
import { useCallback } from "react";

export function useModControls() {
  const { modSettingsService } = useAnalysisApp();

  const modSettings = useObservable(() => modSettingsService.modSettings$, { flashlight: false, hidden: false });
  const setHidden = useCallback((value: boolean) => modSettingsService.setHidden(value), [modSettingsService]);

  return { ...modSettings, setHidden };
}
