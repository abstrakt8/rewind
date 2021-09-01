import { ControlPoint } from "./ControlPoint";
import { TimeSignatures } from "../TimeSignatures";

export class TimingControlPoint extends ControlPoint {
  static DEFAULT: TimingControlPoint;
  static TYPE = "TimingControlPoint";

  beatLength = 1000;
  // TODO: Is this the default value?
  timeSignature: TimeSignatures = TimeSignatures.SimpleQuadruple;

  // The BPM at this control point
  get BPM(): number {
    return 60000 / this.beatLength;
  }

  get type(): string {
    return TimingControlPoint.TYPE;
  }

  isRedundant(existing: ControlPoint): boolean {
    return false;
  }
}
