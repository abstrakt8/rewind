// Version 1.3.3

export type GosuMemoryAPI = {
  settings: {
    showInterface: boolean;
    folders: { game: string; skin: string; songs: string };
  };
  menu: {
    mainMenu: { bassDensity: number };
    state: OsuMemoryStatus;
    gameMode: number;
    isChatEnabled: number;
    bm: {
      time: { firstObj: number; current: number; full: number; mp3: number };
      id: number;
      set: number;
      md5: string;
      rankedStatus: number;
      metadata: { artist: string; title: string; mapper: string; difficulty: string };
      stats: {
        AR: number;
        CS: number;
        OD: number;
        HP: number;
        SR: number;
        BPM: { min: number; max: number };
        maxCombo: number;
        fullSR: number;
        memoryAR: number;
        memoryCS: number;
        memoryOD: number;
        memoryHP: number;
      };
      path: { full: string; folder: string; file: string; bg: string; audio: string };
    };
    mods: { num: number; str: string };
    pp: { "100": number; "99": number; "98": number; "97": number; "96": number; "95": number; strains: number[] };
  };
  gameplay: {
    gameMode: number;
    name: string;
    score: number;
    accuracy: number;
    combo: { current: number; max: number };
    hp: { normal: number; smooth: number };
    hits: {
      "300": number;
      geki: number;
      "100": number;
      katu: number;
      "50": number;
      "0": number;
      sliderBreaks: number;
      grade: { current: string; maxThisPlay: string };
      unstableRate: number;
      hitErrorArray: number[] | null;
    };
    pp: { current: number; fc: number; maxThisPlay: number };
    keyOverlay: {
      k1: { isPressed: boolean; count: number };
      k2: { isPressed: boolean; count: number };
      m1: { isPressed: boolean; count: number };
      m2: { isPressed: boolean; count: number };
    };
    leaderboard: {
      hasLeaderboard: boolean;
      isVisible: boolean;
      ourplayer: {
        name: string;
        score: number;
        combo: number;
        maxCombo: number;
        mods: string;
        h300: number;
        h100: number;
        h50: number;
        h0: number;
        team: number;
        position: number;
        isPassing: number;
      };
      slots: null;
    };
  };
  resultsScreen: {
    name: string;
    score: number;
    maxCombo: number;
    mods: { num: number; str: string };
    "300": number;
    geki: number;
    "100": number;
    katu: number;
    "50": number;
    "0": number;
  };
  tourney: {
    manager: {
      ipcState: number;
      bestOF: number;
      teamName: { left: string; right: string };
      stars: { left: number; right: number };
      bools: { scoreVisible: boolean; starsVisible: boolean };
      chat: string | null;
      gameplay: { score: { left: number; right: number } };
    };
    ipcClients: null;
  };
};

export enum OsuMemoryStatus {
  NotRunning = -1,
  MainMenu = 0,
  EditingMap = 1,
  Playing = 2,
  GameShutdownAnimation = 3,
  SongSelectEdit = 4,
  SongSelect = 5,
  WIP_NoIdeaWhatThisIs = 6,
  ResultsScreen = 7,
  GameStartupAnimation = 10,
  MultiplayerRooms = 11,
  MultiplayerRoom = 12,
  MultiplayerSongSelect = 13,
  MultiplayerResultsscreen = 14,
  OsuDirect = 15,
  RankingTagCoop = 17,
  RankingTeam = 18,
  ProcessingBeatmaps = 19,
  Tourney = 22,

  /// <summary>
  /// Indicates that status read in osu memory is not defined in <see cref="OsuMemoryStatus"/>
  /// </summary>
  Unknown = -2,
}
