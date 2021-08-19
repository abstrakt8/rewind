import { inject, injectable } from "inversify";
import { TYPES } from "./types";

@injectable()
export class AudioService {
  private audioContext: AudioContext;

  constructor(@inject(TYPES.API_URL) private readonly apiUrl: string) {
    this.audioContext = new AudioContext();
  }

  loadMediaElementSourceNode(blueprintId: string) {
    const url = "";
    // This basically creates a <audio/> element
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = url;

    return this.audioContext.createMediaElementSource(audio);
  }

  getSongUrl(blueprintId: string) {
    return `${this.apiUrl}/api/blueprints/${blueprintId}/audio`;
  }
}
