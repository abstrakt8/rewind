import { useState } from "react";
import MrDoobStats from "stats.js";

type StatsProps = {
  initialPanel: number;
  // TODO: Positioning can be configured ...
};

export const usePerformanceMonitor = (props: Partial<StatsProps>) => {
  const [stats] = useState(() => {
    const s = new MrDoobStats();
    s.dom.style.position = "absolute";
    s.dom.style.left = "0px";
    s.dom.style.top = "0px";
    s.dom.style.zIndex = "9000";
    if (props.initialPanel !== undefined) s.showPanel(props.initialPanel);
    return s;
  });
  return stats;
};
