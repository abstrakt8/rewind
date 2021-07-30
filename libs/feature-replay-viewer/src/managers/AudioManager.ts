// // HTML5 Audio supports time stretching without pitch changing (otherwise sounds like night core / chipmunks dying).
// // Chromium's implementation of <audio> is the best.
// // HTML5 Audio currentTime sucks though in terms of accuracy
//
// import axios from "axios";
//
// // https://chinmay.audio/talks/wac-paper/#/
// // https://github.com/WebAudio/web-audio-api-v2/issues/26
//
// // Maybe have this as an option for the user if they really don't care about the off-syncness, but they want to
// // instantly know where they missed in their 40min marathon map.
// // Otherwise it is not really recommended to use HTML5 audio if we want accuracy in the playback.
// const useHtml5Audio = false;
//
// class Sound {
//   context: AudioContext;
//   destination: AudioNode;
//   buffer: AudioBuffer;
//
//   source?: AudioBufferSourceNode;
//   startTime = 0;
//   startOffset = 0;
//   playbackRate = 1;
//   isPlaying = false;
//
//   constructor(context: AudioContext, destination: AudioNode, buffer: AudioBuffer) {
//     this.context = context;
//     this.destination = destination;
//     this.buffer = buffer;
//   }
//
//   play() {
//     this.startTime = this.context.currentTime;
//     this.source = this.context.createBufferSource();
//     this.source.buffer = this.buffer;
//     this.source.playbackRate.value = this.playbackRate;
//     this.source.connect(this.destination);
//     this.source.start(0, this.startOffset);
//     this.isPlaying = true;
//   }
//
//   pause() {
//     if (this.source) {
//       this.source.stop();
//       // Make sure not overflow
//       this.startOffset =
//         (this.startOffset + (this.context.currentTime - this.startTime) * this.playbackRate) % this.buffer.duration;
//       this.isPlaying = false;
//     }
//   }
//
//   currentPosition(): number {
//     let result = this.startOffset;
//     if (this.isPlaying) {
//       result += (this.context.currentTime - this.startTime) * this.playbackRate;
//     }
//     // console.log("currentPosition", result);
//     return result % this.buffer.duration;
//   }
//
//   seekTo(when: number) {
//     if (this.source) {
//       if (this.isPlaying) {
//         this.source.stop();
//       }
//       this.startOffset = when;
//       if (this.isPlaying) {
//         this.play();
//       }
//     }
//   }
//
//   changePlaybackRate(newPlaybackRate: number) {
//     if (this.isPlaying) {
//       this.pause();
//     }
//     this.playbackRate = newPlaybackRate;
//     if (this.isPlaying) {
//       this.play();
//     }
//   }
// }
//
// export type SampleSchedule = {
//   time: number;
//   volume: number;
//   name: string;
//   duration?: number; // for example slider holding
// };
//
// export class AudioManager {
//   context: AudioContext;
//
//   // Just like in osu!, we can change the volume of music and samples separately
//   musicGain: GainNode;
//   samplesGain: GainNode;
//   masterGain: GainNode;
//
//   musicUrl?: string;
//   musicBuffer?: AudioBuffer;
//   music?: Sound;
//
//   song?: MediaElementAudioSourceNode;
//
//   sampleBuffers: { [key: string]: AudioBuffer };
//
//   // In seconds
//   sampleWindow = 0.1;
//   schedulePointer = 0;
//
//   playbackRate = 1;
//   songIsPlaying = false;
//
//   private sampleSchedule: SampleSchedule[] = [];
//
//   constructor() {
//     this.context = new AudioContext();
//
//     this.masterGain = this.context.createGain();
//     this.musicGain = this.context.createGain();
//     this.musicGain.connect(this.masterGain);
//     this.samplesGain = this.context.createGain();
//     this.samplesGain.connect(this.masterGain);
//     this.masterGain.connect(this.context.destination);
//
//     // Just like how I play osu! :) TODO: Make it changeable
//     this.masterGain.gain.value = 0.8;
//     this.musicGain.gain.value = 0.35;
//     this.samplesGain.gain.value = 1.0;
//
//     this.sampleBuffers = {};
//   }
//
//   // https://stackoverflow.com/questions/46327268/audiobuffer-not-cachable-decodeaudiodata-takes-to-long
//   async loadAudioBuffer(url: string): Promise<AudioBuffer> {
//     const audioData = await axios
//       .get(url, {
//         responseType: "arraybuffer", // instead of json
//       })
//       .then((res) => res.data);
//     // TODO: Maybe use fast-decode for large files or we just use <audio>
//     return this.context.decodeAudioData(audioData);
//   }
//
//   async loadSong(url: string): Promise<void> {
//     if (useHtml5Audio) {
//       const audio = new Audio(url);
//       this.song = this.context.createMediaElementSource(audio);
//       this.song.connect(this.musicGain);
//     } else {
//       if (this.musicUrl !== url) {
//         // What if not found ?
//         // TODO: Fast decode
//         this.musicBuffer = await this.loadAudioBuffer(url);
//         this.musicUrl = url;
//       }
//       this.music = new Sound(this.context, this.musicGain, this.musicBuffer as AudioBuffer);
//     }
//   }
//
//   setSampleSchedule(sampleSchedule: SampleSchedule[]) {
//     this.sampleSchedule = sampleSchedule;
//     this.sampleSchedule.sort((a, b) => a.time - b.time);
//   }
//
//   async loadSampleBuffer(name: string, url: string): Promise<AudioBuffer | null> {
//     try {
//       const buffer = await this.loadAudioBuffer(url);
//       return (this.sampleBuffers[name] = buffer);
//     } catch (err) {
//       console.error(`Could not load sample '${name}'` + err);
//       return null;
//     }
//   }
//
//   // Set Samples
//
//   /**
//    * Returns in seconds
//    */
//   getMusicDuration(): number {
//     if (useHtml5Audio) {
//       return this.song?.mediaElement.duration ?? 0;
//     } else {
//       if (!this.musicBuffer) {
//         return 0; // TODO: Maybe return something else
//       }
//       return this.musicBuffer.duration;
//     }
//   }
//
//   checkScheduler() {
//     // Only check for scheduled elements if we are actually playing
//     if (!this.songIsPlaying) {
//       return;
//     }
//     const currentTime = this.currentTime();
//     while (this.schedulePointer < this.sampleSchedule.length) {
//       const s = this.sampleSchedule[this.schedulePointer];
//
//       // console.log("schedule current time ", currentTime, s.time);
//       // We stop because it is out of our time window (too far in the future)
//       if (currentTime + this.sampleWindow / this.playbackRate < s.time) break;
//       this.schedulePointer += 1;
//
//       if (s.time < currentTime) {
//         // Don't know if we want to play it (we can start with an offset)
//         // It might be a little complicated than imagined.
//       } else {
//         const offset = 0;
//         const delay = (s.time - currentTime) / this.playbackRate;
//         const gainNode = this.context.createGain();
//         const node = this.context.createBufferSource();
//
//         // Yeah Idk why there are empty ones
//         if (!this.sampleBuffers[s.name]) {
//           continue;
//         }
//         node.buffer = this.sampleBuffers[s.name];
//         node.playbackRate.value = this.playbackRate;
//         gainNode.gain.value = s.volume;
//         node.connect(gainNode);
//         gainNode.connect(this.samplesGain);
//         // console.log("Starting sample ", s.name, this.context.currentTime + delay);
//
//         node.start(this.context.currentTime + delay, offset);
//       }
//     }
//   }
//
//   play() {
//     if (useHtml5Audio) {
//       if (this.song) {
//         this.song.mediaElement.play();
//         this.songIsPlaying = true;
//       }
//     } else {
//       if (this.music) {
//         this.music.play();
//         this.songIsPlaying = true;
//       }
//     }
//   }
//
//   pause() {
//     if (useHtml5Audio) {
//       if (this.song) {
//         this.song.mediaElement.pause();
//         this.songIsPlaying = false;
//         this.schedulePointer = 0;
//       }
//     } else {
//       if (this.music) {
//         this.music.pause();
//         this.songIsPlaying = false;
//         this.schedulePointer = 0;
//       }
//     }
//   }
//
//   changePlaybackRate(newPlaybackRate: number) {
//     if (useHtml5Audio) {
//       if (this.song) {
//         this.pause();
//         this.playbackRate = newPlaybackRate;
//         this.song.mediaElement.playbackRate = newPlaybackRate;
//         this.play();
//       }
//     } else {
//       if (this.music) {
//         this.pause();
//         this.playbackRate = newPlaybackRate;
//         this.music.changePlaybackRate(newPlaybackRate);
//         this.play();
//       }
//     }
//   }
//
//   // Don't know if this is accurate *enough*
//   currentTime() {
//     if (useHtml5Audio) {
//       return this.song?.mediaElement.currentTime ?? 0;
//     } else {
//       return this.music?.currentPosition() ?? 0;
//     }
//   }
//
//   seekTo(to: number) {
//     if (useHtml5Audio) {
//       if (this.song) {
//         // We also reset the schedulePointer to 0, and maybe possibility to stop samples.
//         this.pause();
//         this.song.mediaElement.currentTime = to;
//         this.play();
//       }
//     } else {
//       if (this.music) {
//         this.pause();
//         this.music.seekTo(to);
//         this.play();
//       }
//     }
//   }
// }
