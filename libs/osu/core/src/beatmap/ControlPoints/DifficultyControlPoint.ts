import { ControlPoint } from "./ControlPoint";

export class DifficultyControlPoint extends ControlPoint {
  static DEFAULT: DifficultyControlPoint = new DifficultyControlPoint();
  static TYPE = "DifficultyControlPoint";
  speedMultiplier = 1;

  get type(): string {
    return DifficultyControlPoint.TYPE;
  }

  isRedundant(existing: ControlPoint): boolean {
    return false;
  }
}
