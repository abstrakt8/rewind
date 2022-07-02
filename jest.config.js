const { getJestProjects } = require("@nrwl/jest");

module.exports = {
  projects: getJestProjects(),
  // Make the environment variables in `.env` accessible through `process.env.*`
  // TODO: For some reason setting this in the global jest.config.js doesn't work and we need to use this in the child config files
  setupFiles: ["dotenv/config"],
};
