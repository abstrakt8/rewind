export class GameSimulatorService {
  onScenarioHasChanged() {
    // We are going to change reset the time machine and so on for the new scenario
    // Maybe start a simulation ... ?
  }

  // Very likely to be a request from the UI since it wants to render the playbar events
  async calculateEvents() {
    // In case it takes unbearably long -> we might need a web worker
  }
}
