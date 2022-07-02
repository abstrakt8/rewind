// import { useStageContext } from "../components/StageProvider/StageProvider";

// export function useEnergySaver(enabled = true) {
//   const isVisible = usePageVisibility();
//   // const { stage } = useStageContext();
//   const { pauseClock } = useGameClockContext();
//
//   useEffect(() => {
//     if (!enabled) {
//       return;
//     }
//     if (!isVisible) {
//       pauseClock();
//       stage.stopTicker();
//     } else {
//       stage.startTicker();
//     }
//   }, [isVisible, stage, pauseClock, enabled]);
// }
