import { Reader } from "./DatabaseReader";
import { Score, ScoresDB } from "./DatabaseTypes";

export class ScoresDBReader extends Reader {
  private readScore(): Score {
    const gameplayMode = this.readByte();
    const version = this.readInt();
    const beatmapMD5 = this.readString();
    const player = this.readString();
    const replayMD5 = this.readString();
    const numberOf300s = this.readShort();
    const numberOf100s = this.readShort();
    const numberOf50s = this.readShort();
    const numberOfGekis = this.readShort();
    const numberOfKatus = this.readShort();
    const numberOfMisses = this.readShort();
    const replayScore = this.readInt();
    const maxCombo = this.readShort();
    const perfectCombo = this.readBoolean();
    const modsBitmask = this.readInt();
    const emptyString = this.readString(); // should always be empty
    const timestamp = this.readLong(); // 64Bit number
    const minus1 = this.readInt(); // should always be 0xffffffff (-1)
    const onlineScoreId = this.readLong();
    // 23 is the bit of target practice
    const targetPracticeEnabled = ((modsBitmask >> 23) & 1) > 0;
    const additionalModInfo = targetPracticeEnabled ? this.readDouble() : 0;

    return {
      gameplayMode,
      version,
      beatmapMD5,
      player,
      replayMD5,
      numberOf50s,
      numberOf100s,
      numberOf300s,
      numberOfGekis,
      numberOfKatus,
      numberOfMisses,
      replayScore,
      maxCombo,
      perfectCombo,
      modsBitmask,
      timestamp,
      onlineScoreId,
      additionalModInfo,
    };
  }

  private readScores(numberOfScores: number): Score[] {
    const scores = [];
    for (let i = 0; i < numberOfScores; i++) {
      scores.push(this.readScore());
    }
    return scores;
  }

  private readBeatmap() {
    const md5hash = this.readString();
    const numberOfScores = this.readInt();
    const scores = this.readScores(numberOfScores);
    return {
      md5hash,
      numberOfScores,
      scores,
    };
  }

  private readBeatmaps(numberOfBeatmaps: number) {
    const beatmaps = [];
    for (let i = 0; i < numberOfBeatmaps; i++) {
      beatmaps.push(this.readBeatmap());
    }
    return beatmaps;
  }

  readScoresDB(): ScoresDB {
    const version = this.readInt();
    const numberOfBeatmaps = this.readInt();
    const beatmaps = this.readBeatmaps(numberOfBeatmaps);

    return {
      version,
      numberOfBeatmaps,
      beatmaps,
    };
  }
}
