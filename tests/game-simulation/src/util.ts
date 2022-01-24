import { join } from "path";
import { OsuClassicMod, parseBlueprint } from "@osujs/core";
import { readFileSync } from "fs";

export function blueprintPath(file: string) {
  const rewindTestDir = process.env.REWIND_TEST_DIR;
  if (!rewindTestDir) {
    throw Error("This function is used with a properly set REWIND_TEST_DIR environment variable!");
  }
  return join(rewindTestDir ?? "", "osu!", "Songs", file);
}

// Move to osu core
export function translateModAcronym(acronym: string): OsuClassicMod {
  switch (acronym) {
    case "HD":
      return "HIDDEN";
    case "HR":
      return "HARD_ROCK";
    case "HT":
      return "HALF_TIME";
    case "DT":
      return "DOUBLE_TIME";
    case "FL":
      return "FLASH_LIGHT";
    case "EZ":
      return "EASY";
    case "NF":
      return "NO_FAIL";
    case "SO":
      return "SPUN_OUT";
  }
  throw Error(`Acronym ${acronym} not known`);
}

export function getBlueprintFromTestDir(file: string) {
  const data = readFileSync(blueprintPath(file), "utf-8");
  return parseBlueprint(data);
}
