import { ControlPoint } from "./ControlPoint";
import { ControlPointInfo } from "./ControlPointInfo";

export class ControlPointGroup {
  time = 0;
  controlPoints: ControlPoint[] = [];
  controlPointInfo?: ControlPointInfo;

  // itemRemoved: any;
  // itemAdded: any;

  constructor(time: number) {
    this.time = time;
  }

  add(point: ControlPoint): void {
    const i = this.controlPoints.findIndex((value) => value.type === point.type);
    if (i > -1) {
      const p = this.controlPoints[i];
      this.controlPoints.splice(i, 1);
      this.controlPointInfo?.groupItemRemoved(p);
    }
    point.attachGroup(this);
    this.controlPoints.push(point);

    this.controlPointInfo?.groupItemAdded(point);
  }
}
