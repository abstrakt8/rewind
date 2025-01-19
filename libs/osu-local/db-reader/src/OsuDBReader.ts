import { Beatmap, OsuDB, StarRatings, TimingPoint } from "./DatabaseTypes";
import { Reader } from "./DatabaseReader";

// Sources:
// https://github.com/Piotrekol/CollectionManager/blob/cb870d363d593035c97dc65f316a93f2d882c98b/CollectionManagerDll/Modules/FileIO/OsuDb/OsuDatabaseReader.cs#L232
// https://github.com/mrflashstudio/OsuParsers/blob/a0d9d18a079f83fd679b31c66d9f315d4b72ca9c/OsuParsers/Serialization/SerializationReader.cs#L52
export class OsuDBReader extends Reader {
  readStarRatings(): StarRatings {
    const buffer = this.buffer;
    // Count can actually be negative
    const count = buffer.readInt32();
    const list: StarRatings = [];
    for (let i = 0; i < count; i++) {
      const b1 = this.readByte(); // === 0x08
      const mods = buffer.readInt32();
      const b2 = buffer.readByte(); // === 0x0c
      const stars = buffer.readFloat();
      if (mods !== undefined && stars !== undefined) list.push([mods, stars]);
    }
    return list;
  }

  readTimingPoints(): TimingPoint[] {
    const count = this.readInt();
    const list: TimingPoint[] = [];
    for (let i = 0; i < count; i++) {
      const bpm = this.readDouble();
      const offset = this.readDouble();
      const inherited = this.readBoolean();
      list.push({ bpm, offset, inherited });
    }
    return list;
  }

  readBeatmap(version: number): Beatmap {
    // TODO:
    const bytesOfBeatmapEntry = version <= 20191107 ? this.readInt() : 0;

    const artist: string = this.readString();
    const artistUnicode: string = this.readString();
    const title: string = this.readString();
    const titleUnicode: string = this.readString();
    const creator: string = this.readString();
    const difficulty: string = this.readString();
    const audioFileName: string = this.readString();
    const md5Hash: string = this.readString();
    const fileName: string = this.readString();
    const rankedStatus: number = this.readByte();
    const circlesCount: number = this.readShort();
    const slidersCount: number = this.readShort();
    const spinnersCount: number = this.readShort();
    const lastModifiedTime: bigint = this.readLong();

    // This is relevant since we will read either 1 byte or 4 bytes.
    const difficultyReader = () => (version <= 20140609 ? this.readByte() : this.readSingle());
    const approachRate: number = difficultyReader();
    const circleSize: number = difficultyReader();
    const hpDrain: number = difficultyReader();
    const overallDifficulty: number = difficultyReader();

    const sliderVelocity: number = this.readDouble();
    const starRatings = () => (version >= 20140609 ? this.readStarRatings() : []);
    const stdStarRatings: StarRatings = starRatings();
    const taikoStarRatings: StarRatings = starRatings();
    const catchStarRatings: StarRatings = starRatings();
    const maniaStarRatings: StarRatings = starRatings();
    const drainTime: number = this.readInt();
    const totalTime: number = this.readInt();
    const audioPreviewTime: number = this.readInt();
    const timingPoints: TimingPoint[] = this.readTimingPoints();
    const beatmapId: number = this.readInt();
    const beatmapSetId: number = this.readInt();
    const threadId: number = this.readInt();
    const stdGrade: number = this.readByte();
    const taikoGrade: number = this.readByte();
    const ctbGrade: number = this.readByte();
    const maniaGrade: number = this.readByte();
    const localOffset: number = this.readShort();
    const stackLeniency: number = this.readSingle();
    const gameplayMode: number = this.readByte();
    const source = this.readString();
    const tags = this.readString();
    const offset: number = this.readShort();
    const titleFont = this.readString();
    const isUnplayed: boolean = this.readBoolean();
    const lastPlayed: bigint = this.readDateTime(); // readDateTime() or readLong()? on wiki it says Long
    const isOsz2: boolean = this.readBoolean();
    const folderName = this.readString();
    const lastCheckedAgainstOsuRepo = this.readDateTime();
    const ignoreBeatmapSound: boolean = this.readBoolean();
    const ignoreBeatmapSkin: boolean = this.readBoolean();
    const disableStoryboard: boolean = this.readBoolean();
    const disableVideo: boolean = this.readBoolean();
    const visualOverride: boolean = this.readBoolean();
    if (version <= 20140609) this.readShort();
    const lastModificationTime = this.readInt(); // ? There is already a last modified time above
    const maniaScrollSpeed = this.readByte();
    return {
      bytesOfBeatmapEntry,
      artist,
      artistUnicode,
      title,
      titleUnicode,
      creator,
      difficulty,
      audioFileName,
      md5Hash,
      fileName,
      rankedStatus,
      circlesCount,
      slidersCount,
      spinnersCount,
      lastModifiedTime,
      approachRate,
      circleSize,
      hpDrain,
      overallDifficulty,
      sliderVelocity,
      stdStarRatings,
      taikoStarRatings,
      catchStarRatings,
      maniaStarRatings,
      drainTime,
      totalTime,
      audioPreviewTime,
      timingPoints,
      beatmapId,
      beatmapSetId,
      threadId,
      stdGrade,
      taikoGrade,
      ctbGrade,
      maniaGrade,
      localOffset,
      stackLeniency,
      gameplayMode,
      source,
      tags,
      offset,
      titleFont,
      isUnplayed,
      lastPlayed,
      isOsz2,
      folderName,
      lastCheckedAgainstOsuRepo,
      ignoreBeatmapSound,
      ignoreBeatmapSkin,
      disableStoryboard,
      disableVideo,
      visualOverride,
      maniaScrollSpeed,
    };
  }

  readBeatmaps = (count: number, version: number) => {
    const beatmaps: Beatmap[] = [];
    // count = 1;
    for (let i = 0; i < count; i++) {
      beatmaps.push(this.readBeatmap(version) as Beatmap);
    }
    return beatmaps;
  };

  readOsuDB = async (): Promise<OsuDB> => {
    const osuVersion = this.readInt();
    const folderCount = this.readInt();
    const accountIsUnlocked = this.readBoolean();
    const accountUnlockDate = this.readDateTime();
    const playerName = this.readString();
    const numberOfBeatmaps = this.readInt();
    const beatmaps = this.readBeatmaps(numberOfBeatmaps, osuVersion);
    const userPermissions = this.readInt();

    return {
      osuVersion,
      folderCount,
      accountIsUnlocked,
      accountUnlockDate,
      playerName,
      numberOfBeatmaps,
      beatmaps,
      userPermissions,
    };
  };
}
