module.exports = {
  displayName: "integration-tests-game-simulation",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  // For some reason we can't have this line in the global jest.config.js - need to investigate later
  setupFiles: ["dotenv/config"],
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/apps/integration-tests/game-simulation",
};
