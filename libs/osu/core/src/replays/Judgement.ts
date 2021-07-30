// import produce from "immer";
// import { Position } from "@rewind/osu/math";
// import { ComboInfo, JudgementTypes } from "./ReplayState";
//
//
// function comboBreak(score: ComboInfo) {
//   return produce(score, (draft) => {
//     draft.currentCombo = 0;
//   });
// }
//
// function comboIncrease(score: ComboInfo) {
//   return produce(score, (draft) => {
//     draft.currentCombo++;
//     draft.maxCombo = Math.max(draft.maxCombo, draft.currentCombo);
//   });
// }
//
// // Question is when is the time to display?
// // At replay frame or at the time it was supposed to be judged?
// function lastTickJudge(
//   score: ComboInfo,
//   checkPointHits: boolean[],
//   sliderEndPosition: Position,
//   supposedToHitTime: number
// ) {
//   const totalCheckpoints = checkPointHits.length;
//   let hitCheckpoints = 0;
//   for (let i = 0; i < checkPointHits.length; i++) {
//     hitCheckpoints += checkPointHits[i] ? 1 : 0;
//   }
//   const judgementWithType = (type: JudgementTypes) => ({ position: sliderEndPosition, time: supposedToHitTime, type });
//
//   if (hitCheckpoints === totalCheckpoints) {
//     return comboIncrease(addJudgeEvent(score, judgementWithType(JudgementTypes.Great)));
//   }
//   if (hitCheckpoints === 0) {
//     return comboBreak(addJudgeEvent(score, judgementWithType(JudgementTypes.Miss)));
//   }
//   const halfCheckpointsHit = hitCheckpoints * 2 >= totalCheckpoints;
//   return addJudgeEvent(score, judgementWithType(halfCheckpointsHit ? JudgementTypes.Ok : JudgementTypes.Meh));
// }
//
// // Checkpoints that are not LAST
// function innerCheckPointJudge(score: ComboInfo, hit: boolean) {
//   if (hit) {
//     return comboIncrease(score);
//   } else {
//     return comboBreak(score);
//   }
// }
//
// function hitCircleJudge(
//   score: ComboInfo,
//   positionalHit: boolean,
//   actualHitTime: number,
//   expectedHitTime: number,
//   circlePosition: Position,
//   hitWindows: number[]
// ) {
//   if (!positionalHit) {
//     return comboBreak(
//       addJudgeEvent(score, {
//         time: actualHitTime,
//         type: JudgementTypes.Miss,
//       })
//     );
//   }
//   const offset = Math.abs(expectedHitTime - actualHitTime);
//   let type = hitWindows.findIndex((h) => offset <= actualHitTime); // TODO: Depending on hitwindows
//   if (type === -1) type = JudgementTypes.Miss; // Technically should not happen... `hit` would be a miss.
//   return comboIncrease(
//     addJudgeEvent(score, {
//       type,
//       time: actualHitTime,
//     })
//   );
// }
