import { Position } from "@rewind/osu/math";

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

const actionBitmaskToActions = (bitmask: number) => {
  const actions = [];
  if (bitmask & 1) actions.push(OsuAction.leftButton);
  if (bitmask & 2) actions.push(OsuAction.rightButton);
  return actions;
};
