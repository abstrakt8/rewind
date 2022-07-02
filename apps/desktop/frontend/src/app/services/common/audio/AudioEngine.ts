import { inject, injectable, postConstruct } from "inversify";
import { AudioSettings, AudioSettingsStore } from "./settings";
import { STAGE_TYPES } from "../../types";
import { GameplayClock } from "../game/GameplayClock";

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
    private readonly audioSettingService: AudioSettingsStore,
    @inject(STAGE_TYPES.AUDIO_CONTEXT) private readonly audioContext: AudioContext,
    private readonly gameClock: GameplayClock,
  ) {
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.samplesGain = this.audioContext.createGain();
    this.samplesGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    // this.handleAudioSettingsChanged(this.audioSettingService.getSettings());
  }

  @postConstruct()
  postConstruct() {
    console.log("Initializing AudioEngine");
    this.setupListeners();
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

  setupListeners() {
    this.gameClock.seeked$.subscribe(this.seekTo.bind(this));
    this.gameClock.isPlaying$.subscribe((isPlaying: boolean) => {
      if (isPlaying) this.start();
      else this.pause();
    });
    this.gameClock.speed$.subscribe(this.changePlaybackRate.bind(this));

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

  destroy() {
    if (this.song) {
      this.song.disconnect();
      this.song = undefined;
    }
    // this.pause();
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
