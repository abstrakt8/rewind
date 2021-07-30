/**
 * https://osu.ppy.sh/wiki/cs/osu!_File_Formats/Db_(file_format)
 To ease the description of the format of each .db file, the following names
 for data types will be used. Unless otherwise specified, all numerical types
 are stored little-endian. Integer values, including bytes, are all unsigned.
 UTF-8 characters are stored in their canonical form, with the higher-order byte first.
 */
type Byte = number;
type Short = number;
type Int = number;
type Long = bigint; // number can only represent up to 2^53
type ULEB128 = bigint; // hmm..
type Single = number; // 32bit IEEE floating point value
type Double = number; // 64bit IEEE floating point value

// osu!.db specific
type IntDoublePair = [Int, Double];
export type TimingPoint = {
  bpm: Double;
  offset: Double;
  inherited: boolean;
};
// 	A 64-bit number of ticks representing a date and time. Ticks are the amount of 100-nanosecond intervals since midnight, January 1, 0001 UTC. See .NET framework documentation on ticks for more information.
type DateTime = bigint;

export type OsuDB = {
  osuVersion: Int;
  folderCount: Int;
  accountIsUnlocked: boolean;
  accountUnlockDate: DateTime;
  playerName: string;
  numberOfBeatmaps: Int;
  beatmaps: Beatmap[];
  userPermissions: Int; // (0 = None, 1 = Normal, 2 = Moderator, 4 = Supporter, 8 = Friend, 16 = peppy, 32 = World Cup staff)
};

enum RankedStatus {
  UNKNOWN = 0,
  UNSUBMITTED = 1,
  PENDING = 2,
  UNUSED = 3,
  RANKED = 4,
  APPROVED = 5,
  QUALIFIED = 6,
  LOVED = 7,
}

enum GameplayMode {
  STD = 0x00,
  TAIKO = 0x01,
  CTB = 0x02,
  MANIA = 0x03,
}

// The first one will be the mods as a mask and the second one as the star rating
export type StarRatings = IntDoublePair[];

export type Beatmap = {
  bytesOfBeatmapEntry: Int;
  artist: string;
  artistUnicode: string;
  title: string;
  titleUnicode: string;
  creator: string;
  difficulty: string; // e.g. Reform's Insane
  audioFileName: string;
  md5Hash: string;
  fileName: string;
  rankedStatus: RankedStatus;
  circlesCount: Short;
  slidersCount: Short;
  spinnersCount: Short;
  lastModifiedTime: DateTime;
  approachRate: Single; // Byte if version <= 20140609
  circleSize: Single;
  hpDrain: Single;
  overallDifficulty: Single;
  sliderVelocity: Double;
  stdStarRatings: StarRatings;
  taikoStarRatings: StarRatings;
  catchStarRatings: StarRatings;
  maniaStarRatings: StarRatings;
  drainTime: Int; // in seconds
  totalTime: Int; // in milliseconds
  audioPreviewTime: Int;
  timingPoints: TimingPoint[];
  beatmapId: Int;
  beatmapSetId: Int;
  threadId: Int;
  stdGrade: Byte;
  taikoGrade: Byte;
  ctbGrade: Byte;
  maniaGrade: Byte;
  localOffset: Short;
  stackLeniency: Single;
  gameplayMode: GameplayMode;
  source: string;
  tags: string;
  offset: Short;
  titleFont: string;
  isUnplayed: boolean;
  lastPlayed: DateTime;
  isOsz2: boolean;
  folderName: string;
  lastCheckedAgainstOsuRepo: DateTime;
  ignoreBeatmapSound: boolean;
  ignoreBeatmapSkin: boolean;
  disableStoryboard: boolean;
  disableVideo: boolean;
  visualOverride: boolean;
  maniaScrollSpeed: Byte;
};

export type Score = {
  gameplayMode: GameplayMode;
  version: Int; // Int
  beatmapMD5: string;
  player: string;
  replayMD5: string;
  numberOf300s: Short; // Short
  numberOf100s: Short; // Short
  numberOf50s: Short; // Short
  numberOfGekis: Short; // Short
  numberOfKatus: Short; // Short
  numberOfMisses: Short; // Short
  replayScore: Int; // Int
  maxCombo: Short; // Short
  perfectCombo: boolean;
  modsBitmask: Int; // Int
  timestamp: DateTime; // Long; in Windows Ticks
  onlineScoreId: Long; // Long
  additionalModInfo: Double; // Double(only present if Target Practice is enabled)
};

export type ScoresDBBeatmap = {
  md5hash: string;
  numberOfScores: Int; // Int
  scores: Score[];
};

export type ScoresDB = {
  version: Int; // Int
  numberOfBeatmaps: Int; // Int
  beatmaps: ScoresDBBeatmap[];
};
