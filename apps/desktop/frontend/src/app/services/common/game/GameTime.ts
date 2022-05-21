export const GameTimeType = Symbol.for("GameTime");

export interface GameTime {
  getTime(): number;
}
