import { EventEmitter2 } from "eventemitter2";
import { injectable } from "inversify";

// export type EventEmitter = EventEmitter2;

@injectable()
export class EventEmitter extends EventEmitter2 {}

export const GameClockEvents = {
  GAME_CLOCK_STARTED: Symbol.for("GAME_CLOCK_STARTED"),
  GAME_CLOCK_PAUSED: Symbol.for("GAME_CLOCK_PAUSED"),
  GAME_CLOCK_SPEED_CHANGED: Symbol.for("GAME_CLOCK_SPEED_CHANGED"),
  GAME_CLOCK_SEEK: Symbol.for("GAME_CLOCK_SEEK"),
  GAME_CLOCK_DURATION_CHANGED: Symbol.for("GAME_CLOCK_DURATION_CHANGED"),
};
