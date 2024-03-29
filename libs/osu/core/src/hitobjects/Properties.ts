import { Position } from "@osujs/math";

export interface HasPosition {
  position: Position;
}

export interface HasHitTime {
  hitTime: number;
}

export interface HasSpawnTime {
  spawnTime: number;
}

export interface HasId {
  id: string;
}
