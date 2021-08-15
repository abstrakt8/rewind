import { injectable } from "inversify";

@injectable()
export class AudioService {
  onScenarioChanged() {
    //
  }

  onPlaybackRateChange() {
    // Need to cancel sample queue and maybe stop the audio altogether
    //
  }

  onPause() {
    // xd
  }
}
