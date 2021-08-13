module.exports = {
  displayName: "feature-replay-viewer",
  preset: "../../jest.preset.js",
  transform: {
    "^.+.(ts|html)$": "ts-jest",
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/libs/feature-replay-viewer",
};
