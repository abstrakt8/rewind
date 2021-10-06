import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";

/**
 * Only one AudioService?
 * Only one AudioContext.
 */
@injectable()
export class AudioService {
  private audioContext: AudioContext;

  audios: Record<string, HTMLAudioElement> = {};

  constructor(@inject(TYPES.API_URL) private readonly apiUrl: string) {
    this.audioContext = new AudioContext();
  }

  async loadAudio(blueprintId: string) {
    const songUrl = `${this.apiUrl}/api/blueprints/${blueprintId}/audio`;
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = songUrl;
    return audio;
  }
}
