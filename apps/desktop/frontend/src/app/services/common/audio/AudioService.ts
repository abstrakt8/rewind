import { injectable } from "inversify";

/**
 * Only one AudioService?
 * Only one AudioContext.
 */
@injectable()
export class AudioService {
  private audioContext: AudioContext;

  audios: Record<string, HTMLAudioElement> = {};

  constructor() {
    this.audioContext = new AudioContext();
  }

  async loadAudio(filePath: string) {
    const songUrl = filePath;
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = songUrl;
    return audio;
  }
}
