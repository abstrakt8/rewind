import { electronApi } from "./electron-api";

describe("electronApi", () => {
  it("should work", () => {
    expect(electronApi()).toEqual("electron-api");
  });
});
