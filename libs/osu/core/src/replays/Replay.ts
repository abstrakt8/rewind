import { Position } from "@osujs/math";

export enum OsuAction {
  leftButton,
  rightButton,
}

export type ReplayFrame = {
  time: number;
  position: Position;
  actions: OsuAction[];
};

export enum ReplayButtonState {
  None = 0,
  Left1 = 1,
  Right1 = 2,
  Left2 = 4,
  Right2 = 8,
  Smoke = 16,
}
