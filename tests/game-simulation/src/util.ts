import { join } from "path";
import { OsuClassicMod, parseBlueprint } from "@osujs/core";
import { readFileSync } from "fs";

function getRewindTestDir() {
  const rewindTestDir = process.env.REWIND_TEST_DIR;
  if (!rewindTestDir) {
    throw Error(`This function only works with a properly set REWIND_TEST_DIR environment variable! Current value of REWIND_TEST_DIR=${rewindTestDir}`);
  }
  return rewindTestDir;
}

export function blueprintPath(file: string) {
  return join(getRewindTestDir(), "osu!", "Songs", file);
}

export function resourcesPath(file: string) {
  return join(getRewindTestDir(), "osujs", file);
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
