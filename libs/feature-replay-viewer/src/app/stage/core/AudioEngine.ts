import { injectable } from "inversify";
import { EventEmitter, GameClockEvents } from "../../events";

// "AudioEngine"
@injectable()
export class AudioEngine {
  constructor(private eventEmitter: EventEmitter) {}

  setupListeners(eventEmitter: EventEmitter) {
    eventEmitter.on(GameClockEvents.GAME_CLOCK_SEEK, this.onGameClockSeek.bind(this));
  }

  onGameClockSeek(timeInMs: number) {
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
