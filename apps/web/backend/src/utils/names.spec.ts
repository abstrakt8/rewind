import { splitByFirstOccurrence } from "./names";

test("splitByFirstOccurrence", () => {
  expect(splitByFirstOccurrence("a:b", ":")).toEqual(["a", "b"]);
  expect(splitByFirstOccurrence("a:b:c", ":")).toEqual(["a", "b:c"]);
  expect(splitByFirstOccurrence("a", ":")).toEqual(["a"]);
});
