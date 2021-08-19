import { inject, injectable } from "inversify";
import { EventEmitter, GameClockEvents } from "../../events";
import { TYPES } from "../types";

// "AudioEngine"
@injectable()
export class AudioEngine {
  // Just like in osu!, we can change the volume of music and samples separately
  musicGain: GainNode;
  samplesGain: GainNode;
  masterGain: GainNode;

  musicUrl?: string;
  musicBuffer?: AudioBuffer;

  song: MediaElementAudioSourceNode;

  // In seconds
  sampleWindow = 0.1;
  schedulePointer = 0;

  constructor(
    @inject(TYPES.AUDIO_CONTEXT) private readonly audioContext: AudioContext,
    @inject(TYPES.SONG_URL) private readonly songUrl: string,
  ) {
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.samplesGain = this.audioContext.createGain();
    this.samplesGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    // TODO: Make it changeable
    this.masterGain.gain.value = 0.8;
    this.musicGain.gain.value = 0.35;
    this.samplesGain.gain.value = 1.0;

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = songUrl;
    this.song = this.audioContext.createMediaElementSource(audio);
    this.song.connect(this.musicGain);
  }

  setupListeners(eventEmitter: EventEmitter) {
    eventEmitter.on(GameClockEvents.GAME_CLOCK_SEEK, (timeInMs) => this.seekTo(timeInMs));
    eventEmitter.on(GameClockEvents.GAME_CLOCK_PAUSED, () => this.pause());
    eventEmitter.on(GameClockEvents.GAME_CLOCK_STARTED, () => this.start());
    eventEmitter.on(GameClockEvents.GAME_CLOCK_SPEED_CHANGED, (speed) => this.changePlaybackRate(speed));
  }

  start() {
    // TODO: ?
    this.audioContext.resume();
    this.song?.mediaElement.play();
  }

  pause() {
    if (this.song) {
      this.song.mediaElement.pause();
      this.schedulePointer = 0;
    }
  }

  changePlaybackRate(newPlaybackRate: number) {
    const wasPlaying = this.isPlaying;
    if (this.song) {
      if (wasPlaying) this.pause();
      this.song.mediaElement.playbackRate = newPlaybackRate;
      if (wasPlaying) this.start();
    }
  }

  // Don't know if this is accurate *enough*
  currentTime() {
    return (this.song?.mediaElement.currentTime ?? 0) * 1000;
  }

  seekTo(toInMs: number) {
    if (this.song) {
      // const wasPlaying = this.isPlaying;
      // We also reset the schedulePointer to 0, and maybe possibility to stop samples.
      // if (wasPlaying) this.pause();
      this.song.mediaElement.currentTime = toInMs / 1000;
      // if (wasPlaying) this.start();
    }
  }

  get isPlaying() {
    return !this.song?.mediaElement.paused;
  }

  togglePlaying(): boolean {
    if (this.isPlaying) this.pause();
    else this.start();
    return this.isPlaying;
  }

  get durationInMs() {
    return (this.song?.mediaElement.duration ?? 1) * 1000;
  }

  destroy() {
    this.pause();
    // this.audioContext.close().then(() => {
    //   console.log("Audio context closed.");
    // });
  }
}

// // HTML5 Audio supports time stretching without pitch changing (otherwise sounds like night core / chipmunks dying).
// // Chromium's implementation of <audio> is the best.
// // HTML5 Audio currentTime sucks though in terms of accuracy
