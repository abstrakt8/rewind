import { injectable } from "inversify";
import { PixiRendererManager } from "../../../renderers/PixiRendererManager";
import { BehaviorSubject } from "rxjs";

/**
 * Main idea taken from:
 */
@injectable()
export class ClipRecorder {
  chunks: Blob[] = [];
  recordingSince$: BehaviorSubject<number>;
  recorder?: MediaRecorder;

  constructor(private readonly renderManager: PixiRendererManager) {
    this.recordingSince$ = new BehaviorSubject<number>(0);
  }

  startRecording() {
    const renderer = this.renderManager.getRenderer();
    if (!renderer) {
      console.error("Can not start recording without a renderer");
      return;
    }
    this.recordingSince$.next(performance.now());
    this.chunks = [];

    const canvas = renderer.view;
    const context = canvas.getContext("webgl2");
    // context.getImageData()
    const frameRate = 30;

    const stream = canvas.captureStream(frameRate);
    this.recorder = new MediaRecorder(stream);
    // Every time the recorder has new data, we will store it in our array
    this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.recorder.onstop = (e) => {
      this.exportVideo();
    };
    this.recorder.start();
  }

  exportVideo() {
    console.log(`Recording chunks.size = ${this.chunks.length}`);
    this.recordingSince$.next(0);

    const blob = new Blob(this.chunks, { type: "video/webm" });
    const vid = document.createElement("video");
    vid.src = URL.createObjectURL(blob);
    vid.controls = true;

    const a = document.createElement("a");
    a.href = vid.src;
    a.download = `Rewind Clip ${new Date().toISOString()}.webm`;
    a.click();
    a.remove();
  }

  stopRecording() {
    this.recorder?.stop();
  }
}
