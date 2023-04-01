import { floatEqual } from "@osujs/math";

export interface Comparable<T> {
  compareTo(t: T): number;
}

export class SortedList<T extends Comparable<T>> {
  list: T[];

  constructor() {
    this.list = [];
  }

  // binary search or not -> the insert/remove is also O(n) ....
  indexOf(t: T): number {
    return this.list.findIndex((value) => floatEqual(t.compareTo(value), 0));
  }

  // This will also maintain insertion order, which means that adding a 2' to [1, 2, 3] will result to [1, 2, 2', 3].
  add(t: T): void {
    const i = this.list.findIndex((value) => t.compareTo(value) < 0);
    if (i === -1) {
      // This means that there is no element that is larger than the given value
      this.list.splice(this.list.length, 0, t);
    } else {
      this.list.splice(i, 0, t);
    }
  }

  remove(t: T): void {
    const i = this.indexOf(t);
    if (i > -1) {
      this.list.splice(i, 1);
    }
  }

  get(i: number): T {
    return this.list[i];
  }

  get length(): number {
    return this.list.length;
  }
}
