import { Comparable, SortedList } from "./SortedList";

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
    expect(list.get(0).value).toBe(309);
    expect(list.get(1).value).toBe(400);
  });

  it("should be sorted after adding two elements in non sorted order", function () {
    const list = new SortedList<A>();
    list.add(new A(400));
    list.add(new A(309));
    expect(list.get(0).value).toBe(309);
    expect(list.get(1).value).toBe(400);
  });
});
