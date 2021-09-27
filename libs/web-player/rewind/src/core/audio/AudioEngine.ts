import { inject, injectable, postConstruct } from "inversify";
import { EventEmitter, GameClockEvents } from "../../events";
import { STAGE_TYPES } from "../../types/STAGE_TYPES";
import { AudioSettingsService } from "../../settings/AudioSettingsService";
import { AudioSettings } from "../../settings/AudioSettings";
import { debounceTime } from "rxjs/operators";

// HTML5 Audio supports time stretching without pitch changing (otherwise sounds like night core)
// Chromium's implementation of <audio> is the best.
// HTML5 Audio currentTime sucks though in terms of accuracy

// "AudioEngine"
@injectable()
export class AudioEngine {
  // Just like in osu!, we can change the volume of music and samples separately
  musicGain: GainNode;
  samplesGain: GainNode;
  masterGain: GainNode;

  musicUrl?: string;
  musicBuffer?: AudioBuffer;

  song?: MediaElementAudioSourceNode;

  // In seconds
  sampleWindow = 0.1;
  schedulePointer = 0;

  constructor(
    private readonly audioSettingService: AudioSettingsService,
    @inject(STAGE_TYPES.AUDIO_CONTEXT) private readonly audioContext: AudioContext,
    @inject(STAGE_TYPES.EVENT_EMITTER) private readonly eventEmitter: EventEmitter,
  ) {
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.samplesGain = this.audioContext.createGain();
    this.samplesGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    this.handleAudioSettingsChanged(this.audioSettingService.getSettings());
  }

  @postConstruct()
  postConstruct() {
    this.setupListeners(this.eventEmitter);
  }

  // async loadSong(songUrl: string) {
  //   // Disconnect other one?
  //   const audio = new HTMLAudioElement();
  //   audio.crossOrigin = "anonymous";
  //   audio.src = songUrl;
  //   this.song = this.audioContext.createMediaElementSource(audio);
  //   this.song.connect(this.musicGain);
  // }
  //
  setSong(audio: HTMLAudioElement) {
    this.song = this.audioContext.createMediaElementSource(audio);
    this.song.connect(this.musicGain);
  }

  setupListeners(eventEmitter: EventEmitter) {
    eventEmitter.on(GameClockEvents.GAME_CLOCK_SEEK, (timeInMs) => this.seekTo(timeInMs));
    eventEmitter.on(GameClockEvents.GAME_CLOCK_PAUSED, () => this.pause());
    eventEmitter.on(GameClockEvents.GAME_CLOCK_STARTED, () => this.start());
    eventEmitter.on(GameClockEvents.GAME_CLOCK_SPEED_CHANGED, (speed) => this.changePlaybackRate(speed));

    this.audioSettingService.settings$.subscribe((value) => this.handleAudioSettingsChanged(value));
  }

  start() {
    // TODO: ???
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
    if (this.song) {
      this.song.mediaElement.playbackRate = newPlaybackRate;
    }
  }

  // Don't know if this is accurate *enough*
  currentTime() {
    return (this.song?.mediaElement.currentTime ?? 0) * 1000;
  }

  seekTo(toInMs: number) {
    if (this.song) {
      this.song.mediaElement.currentTime = toInMs / 1000;
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

  // TODO: @preDestroy ?
  destroy() {
    this.pause();
    // this.audioContext.close().then(() => {
    //   console.log("Audio context closed.");
    // });
  }

  private handleAudioSettingsChanged(settings: AudioSettings) {
    const { muted, volume } = settings;
    this.masterGain.gain.value = muted ? 0 : volume.master;
    this.musicGain.gain.value = volume.music;
    this.samplesGain.gain.value = volume.effects;
  }
}
