const { calculateProjectDependencies } = require("@nrwl/workspace/src/utilities/buildable-libs-utils");

const { readCachedProjectGraph } = require("@nrwl/workspace/src/core/project-graph");

const projGraph = readCachedProjectGraph();

const root = ".";
const projectName = "desktop-backend";
const targetName = "build";
const contextName = "";
const { target, dependencies } = calculateProjectDependencies(projGraph, root, projectName, targetName, contextName);

console.log(dependencies);
console.log(dependencies.map((s) => s.node.data));
