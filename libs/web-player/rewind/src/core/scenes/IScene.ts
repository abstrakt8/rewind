// Scene that needs to be implemented by the user
// Ideas taken from Phaser3 https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/
import { Container } from "pixi.js";

export interface UserScene {
  // Initialize
  init(data: unknown): void;

  // Loading assets
  preload(): Promise<void>;

  // Creates stage objects
  create(): void;

  // This function is updated every tick.
  update(deltaTimeInMs: number): void;

  // Free resources, unsubscribe from events, etc.
  destroy(): void;

  stage: Container;
}

// Not to be implemented by the user

type ManagedSceneState = "INITIALIZING" | "PLAYING" | "PAUSED" | "SLEEPING";

export class ManagedScene implements UserScene {
  state: ManagedSceneState = "INITIALIZING";

  constructor(private readonly scene: UserScene, public readonly key: string) {}

  get stage() {
    return this.scene.stage;
  }

  pause() {
    this.state = "PAUSED";
  }

  resume() {
    this.state = "PLAYING";
  }

  sleep() {
    this.state = "SLEEPING";
  }

  destroy(): void {
    return this.scene.destroy();
  }

  init(data: unknown): void {
    return this.scene.init(data);
  }

  async preload(): Promise<void> {
    return this.scene.preload();
  }

  update(deltaTimeInMs: number): void {
    if (this.state === "PLAYING") {
      console.log(`Scene ${this.key} is getting updated with dt=${deltaTimeInMs}ms`);
      return this.scene.update(deltaTimeInMs);
    }
  }

  create(): void {
    return this.scene.create();
  }
}
