import { inject, injectable, postConstruct } from "inversify";
import { AudioSettings, AudioSettingsStore } from "./settings";
import { STAGE_TYPES } from "../../types";
import { GameplayClock } from "../game/GameplayClock";

// HTML5 Audio supports time stretching without pitch changing (otherwise sounds like night core)
// Chromium's implementation of <audio> is the best.
// HTML5 Audio currentTime sucks though in terms of accuracy

export interface HitSampleEvent {
  // Game time in ms.
  time: number;
  // Sample keys to play, e.g. ["normal-hitnormal", "soft-hitclap3"].
  names: string[];
  // In [0, 1], applied on top of the global effects volume.
  volume: number;
}

// Events that were crossed by more than this many game-time milliseconds are not played. This avoids a burst of
// hit sounds after a lag spike or when the pointer wasn't reset (e.g. big forward jump).
const MAX_SAMPLE_LAG_MS = 200;

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

  // Decoded hit sound buffers keyed by sample key. Beatmap samples take precedence over skin samples when enabled.
  private skinSampleBuffers: Record<string, AudioBuffer> = {};
  private beatmapSampleBuffers: Record<string, AudioBuffer> = {};
  private beatmapHitsoundsEnabled = true;
  private sampleSchedule: HitSampleEvent[] = [];
  // Index into `sampleSchedule` of the next event to play.
  private samplePointer = 0;

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
      // The music time-stretches (pitch preserved) so that DT/HT doesn't sound like nightcore.
      this.song.mediaElement.playbackRate = newPlaybackRate;
    }
  }

  private async decodeSamples(raw: Record<string, ArrayBuffer>): Promise<Record<string, AudioBuffer>> {
    const buffers: Record<string, AudioBuffer> = {};
    await Promise.all(
      Object.entries(raw).map(async ([name, arrayBuffer]) => {
        try {
          // decodeAudioData detaches the ArrayBuffer, so give it a copy in case the caller reuses it.
          buffers[name] = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
        } catch (e) {
          console.error(`Could not decode hit sound sample '${name}'`, e);
        }
      }),
    );
    return buffers;
  }

  async loadHitSoundSamples(skin: Record<string, ArrayBuffer>, beatmap: Record<string, ArrayBuffer>) {
    const [skinBuffers, beatmapBuffers] = await Promise.all([this.decodeSamples(skin), this.decodeSamples(beatmap)]);
    this.skinSampleBuffers = skinBuffers;
    this.beatmapSampleBuffers = beatmapBuffers;
  }

  setSampleSchedule(schedule: HitSampleEvent[]) {
    this.sampleSchedule = [...schedule].sort((a, b) => a.time - b.time);
    this.resetSamplePointer(this.gameClock.timeElapsedInMs);
  }

  private clearSampleSchedule() {
    this.sampleSchedule = [];
    this.samplePointer = 0;
  }

  // Moves the pointer to the first event strictly after `timeInMs` without playing anything (used after seeking).
  private resetSamplePointer(timeInMs: number) {
    const schedule = this.sampleSchedule;
    let lo = 0,
      hi = schedule.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (schedule[mid].time <= timeInMs) lo = mid + 1;
      else hi = mid;
    }
    this.samplePointer = lo;
  }

  private playSample(name: string, volume: number) {
    const buffer =
      (this.beatmapHitsoundsEnabled ? this.beatmapSampleBuffers[name] : undefined) ?? this.skinSampleBuffers[name];
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    // Natural pitch regardless of game speed: a source's playbackRate would resample and shift pitch, unlike the
    // pitch-preserving HTML5 music element.
    const gain = this.audioContext.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.samplesGain);
    source.start();
  }

  /**
   * Plays every scheduled hit sound that the game clock has crossed since the last call. Should be called once per
   * frame with the current game time. Does nothing while the clock is paused.
   */
  playSamplesUpTo(nowInMs: number) {
    if (!this.gameClock.isPlaying) return;
    const schedule = this.sampleSchedule;
    while (this.samplePointer < schedule.length && schedule[this.samplePointer].time <= nowInMs) {
      const entry = schedule[this.samplePointer];
      this.samplePointer++;
      if (nowInMs - entry.time > MAX_SAMPLE_LAG_MS) continue;
      for (const name of entry.names) this.playSample(name, entry.volume);
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
    this.resetSamplePointer(toInMs);
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
    this.clearSampleSchedule();
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
    this.beatmapHitsoundsEnabled = settings.beatmapHitsounds;
  }
}
