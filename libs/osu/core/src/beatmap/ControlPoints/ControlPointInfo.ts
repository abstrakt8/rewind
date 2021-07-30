import { DifficultyControlPoint } from "./DifficultyControlPoint";
import { TimingControlPoint } from "./TimingControlPoint";
import { ControlPoint } from "./ControlPoint";
import { EffectControlPoint } from "./EffectControlPoint";
import { SampleControlPoint } from "./SampleControlPoint";
import { ControlPointGroup } from "./ControlPointGroup";
import { floatEqual } from "osu-math";
import { SortedList } from "../../utils/SortedList";

export class ControlPointInfo {
  difficultyPoints: SortedList<DifficultyControlPoint> = new SortedList<DifficultyControlPoint>();
  timingPoints: SortedList<TimingControlPoint> = new SortedList<TimingControlPoint>();
  effectPoints: SortedList<EffectControlPoint> = new SortedList<EffectControlPoint>();
  samplePoints: SortedList<SampleControlPoint> = new SortedList<SampleControlPoint>();

  // Why not use SortedList here ?
  groups: ControlPointGroup[] = [];

  difficultyPointAt(time: number): DifficultyControlPoint {
    return this.binarySearchWithFallback(this.difficultyPoints.list, time, DifficultyControlPoint.DEFAULT);
  }

  samplePointAt(time: number): SampleControlPoint {
    return this.binarySearchWithFallback(
      this.samplePoints.list,
      time,
      this.samplePoints.length > 0 ? this.samplePoints.list[0] : SampleControlPoint.DEFAULT
    );
  }

  add(time: number, controlPoint: ControlPoint): boolean {
    if (this.checkAlreadyExisting(time, controlPoint)) return false;
    const g = this.groupAt(time, true) as ControlPointGroup;
    g.add(controlPoint);

    return true;
  }

  groupAt(time: number, addIfNotExisting = false): ControlPointGroup | null {
    const newGroup = new ControlPointGroup(time);

    const found = this.groups.find((o) => floatEqual(o.time, time));
    if (found) return found;
    if (addIfNotExisting) {
      // this is a workaround for the following two uncommented lines
      newGroup.controlPointInfo = this;
      // newGroup.itemAdded = this.groupItemAdded;
      // newGroup.itemRemoved = this.groupItemRemoved;
      this.groups.push(newGroup);

      // osu!lazer they use .insert(~i) to maintain it sorted ... -> isn't this O(n^2)?

      // we sort cause lazy rn (optimize later)
      this.groups.sort((a, b) => a.time - b.time);

      return newGroup;
    }
    return null;
  }

  groupItemAdded(controlPoint: ControlPoint): void {
    switch (controlPoint.type) {
      case TimingControlPoint.TYPE:
        this.timingPoints.add(controlPoint as TimingControlPoint);
        break;
      case EffectControlPoint.TYPE:
        this.effectPoints.add(controlPoint as EffectControlPoint);
        break;
      case SampleControlPoint.TYPE:
        this.samplePoints.add(controlPoint as SampleControlPoint);
        break;
      case DifficultyControlPoint.TYPE:
        this.difficultyPoints.add(controlPoint as DifficultyControlPoint);
        break;
    }
  }

  groupItemRemoved(controlPoint: ControlPoint): void {
    switch (controlPoint.type) {
      case TimingControlPoint.TYPE:
        this.timingPoints.remove(controlPoint as TimingControlPoint);
        break;
      case EffectControlPoint.TYPE:
        this.effectPoints.remove(controlPoint as EffectControlPoint);
        break;
      case SampleControlPoint.TYPE:
        this.samplePoints.remove(controlPoint as SampleControlPoint);
        break;
      case DifficultyControlPoint.TYPE:
        this.difficultyPoints.remove(controlPoint as DifficultyControlPoint);
        break;
    }
  }

  timingPointAt(time: number): TimingControlPoint {
    return this.binarySearchWithFallback(
      this.timingPoints.list,
      time,
      this.timingPoints.length > 0 ? this.timingPoints.get(0) : TimingControlPoint.DEFAULT
    );
  }

  effectPointAt(time: number): EffectControlPoint {
    return this.binarySearchWithFallback(this.effectPoints.list, time, EffectControlPoint.DEFAULT);
  }

  binarySearchWithFallback<T extends ControlPoint>(list: T[], time: number, fallback: T): T {
    const obj = this.binarySearch(list, time);
    return obj ?? fallback;
  }

  // Find the first element that has a time not less than the given time.
  binarySearch<T extends ControlPoint>(list: T[], time: number): T | null {
    if (list === null) throw new Error("Argument null");
    if (list.length === 0 || time < list[0].time) return null;

    let lo = 0;
    let hi = list.length;
    // Find the first index that has a time greater than current one.
    // The previous one will then be the answer.
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1);
      if (list[mid].time <= time) lo = mid + 1;
      else hi = mid;
    }
    return list[lo - 1];
  }

  private checkAlreadyExisting(time: number, newPoint: ControlPoint): boolean {
    let existing: ControlPoint | null = null;

    switch (newPoint.type) {
      case TimingControlPoint.TYPE:
        existing = this.binarySearch(this.timingPoints.list, time);
        break;
      case EffectControlPoint.TYPE:
        existing = this.effectPointAt(time);
        break;
      case SampleControlPoint.TYPE:
        existing = this.binarySearch(this.samplePoints.list, time);
        break;
      case DifficultyControlPoint.TYPE:
        existing = this.difficultyPointAt(time);
        break;
    }

    // TODO: in osu!lazer it's written with newPoint?.isRedundant
    return existing ? newPoint.isRedundant(existing) : false;
  }
}
