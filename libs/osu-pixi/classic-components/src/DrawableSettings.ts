import { Position } from "@osujs/math";

export interface AnimationTimeSetting {
  time: number;
}

export interface ModHiddenSetting {
  modHidden: boolean;
}
export interface PositionSetting {
  position: Position;
}

export interface ScaleSetting {
  scale: number;
}

export interface TintSetting {
  tint: number;
}

// Replaces ArmedState
//  -> if there is no HitResult => IDLE
//  -> if there is one then we also know the timing
export type HitResult = {
  hit: boolean;
  timing: number;
};
export type HitResultSetting = {
  hitResult?: HitResult;
};
