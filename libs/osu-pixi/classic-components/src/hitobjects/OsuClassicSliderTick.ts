// import { Disposable, HasRenderTime } from "./DrawableHitObject";
// import { Preparable } from "../utils/Preparable";
// import { ModHiddenSetting, SkinSetting } from "./DrawableSettings";
// import { createCenteredSprite, fadeInWithDuration, fadeOutWithDuration } from "../utils/Pixi";
// import { Container, Sprite } from "pixi.js";
//
// type Settings = SkinSetting &
//   ModHiddenSetting & {
//     approachTime: number;
//   };
//
// type SliderTick = {};
// // TODO:...
// export class ClassicSliderTick extends Container implements Preparable, Disposable, HasRenderTime {
//   private readonly settings: Settings;
//   private readonly tick: SliderTick;
//   private readonly sprite: Sprite;
//
//   constructor(tick: SliderTick, settings: Settings) {
//     super();
//     this.settings = settings;
//     this.tick = tick;
//     this.sprite = createCenteredSprite();
//     this.addChild(this.sprite);
//   }
//
//   // SliderEndCircle.cs
//   renderStartTime(): number {
//     return this.tick.startTime - this.tick.timePreempt;
//   }
//
//   get animDuration(): number {
//     return 150;
//   }
//
//   renderEndTime(): number {
//     return this.tick.startTime + this.animDuration;
//   }
//
//   dispose(): void {
//     return;
//   }
//
//   prepareFor(time: number): void {
//     const { startTime, stackedPosition, scale } = this.tick;
//     const { skin } = this.settings;
//
//     // Maybe this is slow idk
//     this.sprite.texture = skin.getTexture(SkinTextures.SLIDER_TICK);
//     this.alpha = 1;
//     // monkaHmm stackedPosition might be wrong
//     this.position.set(stackedPosition.x, stackedPosition.y);
//     this.scale.set(scale);
//
//     if (fadeInWithDuration(this, time, startTime - 727, 727)) {
//       return;
//     }
//     // TODO: fadeOut based on hitResult
//     fadeOutWithDuration(this, time, startTime, this.animDuration);
//   }
// }
