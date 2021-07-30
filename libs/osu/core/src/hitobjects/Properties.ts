import { Position } from "@rewind/osu/math";

export interface HasPosition {
  position: Position;
}

export interface HasHitTime {
  hitTime: number;
}

// Difference between VisibleTime and SpawnTime:
// Imagine in CounterStrike those filthy spawn campers that hover their AK47s over the silhouettes of the poor noobs
// that they are about to execute. Those players haven't been spawned yet, which means no interaction is possible,
// however their silhouettes are visible already at VisibleTime.
export interface HasSpawnTime {
  spawnTime: number;
}

export interface HasId {
  id: string;
}
