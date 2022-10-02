import { normalizeModsForSR } from "./mods";

describe("Mods reduction", function () {
  it("FL,HD -> HD,FL", function () {
    expect(normalizeModsForSR(["HIDDEN", "FLASH_LIGHT"])).toEqual(["FLASH_LIGHT", "HIDDEN"]);
  });
  // Tests sorting
  it("HD,FL -> FL,HD", function () {
    expect(normalizeModsForSR(["FLASH_LIGHT", "HIDDEN"])).toEqual(["FLASH_LIGHT", "HIDDEN"]);
  });

  it("Some cases", function () {
    expect(normalizeModsForSR([])).toEqual([]);
    expect(normalizeModsForSR(["NO_FAIL"])).toEqual([]);
    expect(normalizeModsForSR(["HIDDEN", "HARD_ROCK"])).toEqual(["HARD_ROCK"]);
    expect(normalizeModsForSR(["DOUBLE_TIME", "HARD_ROCK", "HIDDEN", "FLASH_LIGHT"])).toEqual([
      "DOUBLE_TIME",
      "FLASH_LIGHT",
      "HARD_ROCK",
      "HIDDEN",
    ]);
  });
});
