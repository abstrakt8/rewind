import { StableGameSimulator } from "./app/StableGameSimulator";
import { GameSimulator } from "./app/GameSimulator";
import * as walk from "walk";
import { basename, extname } from "path";

// Read from test-suite
interface TestCase {}

const simulators: GameSimulator[] = [new StableGameSimulator()];

interface Config {
  persistResults: boolean;
}

function runTests(config: Config) {
  // Load test cases from database
  // Run the cases
  //    (also measure ms)
  // Store the results into database again, if required
  // It's important to track history
}

function persistWithMongoDB(blueprintsFolder: string) {
  const walker = walk.walk(blueprintsFolder);
  walker.on("file", (root, fileStats, next) => {
    const dir = basename(root);
    const name = fileStats.name;

    // console.log(dir, name);
    if (extname(name) !== ".osu") {
      next();
      return;
    }
    // console.log(dir, name);
    next();
  });
  walker.on("end", () => {
    console.log("done");
  });
}

// persistWithMongoDB("E:\\osu!");
