//
// import { Score as DBScore, ScoresDBReader } from "osu-db-parser";
// import { readFile } from "fs/promises";
//
// import { legacyReplayFileName } from "../utils/stable";
// import { ticksToDate } from "../utils/dates";
// import { fileLastModifiedTime } from "../utils/files";
// import { LocalScore } from "../models/LocalScore";
//
// const mapDBScores = (s: DBScore): LocalScore => {
//   return {
//     replayMD5: s.replayMD5,
//     timestamp: ticksToDate(s.timestamp)[0],
//     windowsTimeStamp: s.timestamp,
//     localFileName: legacyReplayFileName(s.beatmapMD5, s.timestamp),
//     onlineScoreId: s.onlineScoreId,
//   };
// };
//
// // In osu!lazer the implementation will differ again
// export class ScoresDBDao {
//   private lastMtime = -1;
//   private scores: LocalScore[] = [];
//   private scoresByBeatmap: Map<string, LocalScore[]> = new Map<string, LocalScore[]>();
//
//   constructor(private readonly scoresDBPath: string) {}
//
//   private async createReader() {
//     const buffer = await readFile(this.scoresDBPath);
//     return new ScoresDBReader(buffer);
//   }
//
//   async getAllScores(force?: boolean): Promise<LocalScore[]> {
//     const lastModified = await fileLastModifiedTime(this.scoresDBPath);
//     if (lastModified === this.lastMtime && !force) {
//       return this.scores;
//     }
//     this.lastMtime = lastModified;
//     const reader = await this.createReader();
//
//     this.scores = [];
//     this.scoresByBeatmap.clear();
//
//     reader.readScoresDB().beatmaps.forEach((b) => {
//       const s = b.scores.map(mapDBScores);
//       this.scoresByBeatmap.set(b.md5hash, s);
//       this.scores.push(...s);
//     });
//     return this.scores;
//   }
//
//   /**
//    * @param replayMD5
//    */
//   async getScoreByReplayMD5(replayMD5: string): Promise<LocalScore | undefined> {
//     const scores = await this.getAllScores();
//     return scores.find((s) => s.replayMD5 === replayMD5);
//   }
//
//   async getScoreByBeatmapAndReplayMD5(beatmapMD5: string, replayMD5: string): Promise<LocalScore | undefined> {
//     await this.getAllScores();
//     const scores = this.scoresByBeatmap.get(beatmapMD5);
//     return scores && scores.find((s) => s.replayMD5 === replayMD5);
//   }
//
//   async getScoresByBeatmapMD5(beatmapMD5: string): Promise<LocalScore[] | undefined> {
//     await this.getAllScores();
//     return this.scoresByBeatmap.get(beatmapMD5);
//   }
// }
