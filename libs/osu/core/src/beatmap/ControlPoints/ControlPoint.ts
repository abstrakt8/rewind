import { ControlPointGroup } from "./ControlPointGroup";
import { Comparable } from "../../utils/SortedList";

export abstract class ControlPoint implements Comparable<ControlPoint> {
  controlPointGroup?: ControlPointGroup;

  get time(): number {
    return this.controlPointGroup?.time ?? 0;
  }

  abstract get type(): string;

  abstract isRedundant(existing: ControlPoint): boolean;

  compareTo(other: ControlPoint): number {
    return this.time - other.time;
  }

  attachGroup(pointGroup: ControlPointGroup): void {
    this.controlPointGroup = pointGroup;
  }
}
