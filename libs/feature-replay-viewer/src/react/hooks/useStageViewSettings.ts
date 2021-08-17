import { useStageContext } from "@rewind/feature-replay-viewer";
import { useCallback, useState } from "react";

export function useStageViewSettings() {
  const { stage } = useStageContext();
  const { stageViewService } = stage;
  const view = stageViewService.getView();

  const [modHidden, setModHidden] = useState(view.modHidden);

  const toggleModHidden = useCallback(() => {
    view.modHidden = !view.modHidden;
    setModHidden(view.modHidden);
  }, [view]);
  return {
    modHidden,
    toggleModHidden,
  };
}
