/**
 * The one that gets parsed from an .osr file
 * This is exactly like the one you would get from osr-node
 */
export class RawReplayData {
  gameMode = 0;
  gameVersion = 0;
  beatmapMD5 = "";
  playerName = "";
  replayMD5 = "";
  number_300s = 0;
  number_100s = 0;
  number_50s = 0;
  gekis = 0;
  katus = 0;
  misses = 0;
  score = 0;
  max_combo = 0;
  perfect_combo = 0;
  mods = 0;
  life_bar = "";
  timestamp = 0;
  replay_length = 0;
  replay_data = "";
  unknown = 0;
}
