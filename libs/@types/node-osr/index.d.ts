// Type definitions for node-osr
// Project: Node OSR Reader
// Definitions by: abstrakt

export class Replay {
  gameMode: number;
  gameVersion: number;
  beatmapMD5: string;
  playerName: string;
  replayMD5: string;
  number_300s: number;
  number_100s: number;
  number_50s: number;
  gekis: number;
  katus: number;
  misses: number;
  score: number;
  max_combo: number;
  perfect_combo: number;
  mods: number;
  life_bar: string;
  timestamp: number;
  replay_length: number;
  replay_data: string;

  serializeSync(): Buffer;

  serialize(): Promise<Buffer>;

  writeSync(path: string);

  write(path: string, cb?: any);
}

/**
 * @param input either the filename to read or a buffer
 */
export function read(input: string | Buffer): Promise<Replay>;
/**
 *
 * @param input either the filename to read or a buffer
 * @param cb the callback
 * @private
 */
export function read(input: string | Buffer, cb?: (err: Error, replay: Replay) => unknown): void;

/**
 * @param input either the filename to read or a buffer
 */
export function readSync(input: string | Buffer): Replay;
