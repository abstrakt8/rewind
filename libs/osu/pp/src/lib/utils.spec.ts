import { insertDecreasing } from "./utils";

describe("insertDecreasing", function () {
  it("empty", function () {
    const q = [];
    insertDecreasing(q, 3, 10);
    expect(q).toEqual([3]);
  });
  it("inserting a new one", function () {
    const q = [4, 3, 2, 1];
    insertDecreasing(q, 5, 5);
    expect(q).toEqual([5, 4, 3, 2, 1]);
  });
  it("normal case", function () {
    const q = [5, 4, 3, 2, 1];
    insertDecreasing(q, 3, 5);
    expect(q).toEqual([5, 4, 3, 3, 2]);
  });
});
