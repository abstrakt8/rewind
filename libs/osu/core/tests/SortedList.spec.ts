import { Comparable, SortedList } from "../src/utils/SortedList";
import * as assert from "assert";

describe("SortedList with a simple Comparable class", function () {
  class A implements Comparable<A> {
    value: number;

    constructor(value: number) {
      this.value = value;
    }

    compareTo(t: A): number {
      return this.value - t.value;
    }
  }

  it("should be sorted after adding two elements in the sorted order", function () {
    const list = new SortedList<A>();
    list.add(new A(309));
    list.add(new A(400));
    assert.strictEqual(list.get(0).value, 309);
    assert.strictEqual(list.get(1).value, 400);
  });

  it("should be sorted after adding two elements in non sorted order", function () {
    const list = new SortedList<A>();
    list.add(new A(400));
    list.add(new A(309));
    assert.strictEqual(list.get(0).value, 309);
    assert.strictEqual(list.get(1).value, 400);
  });
});
