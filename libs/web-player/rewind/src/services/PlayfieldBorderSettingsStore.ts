import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { PlayfieldBorderSettings } from "@rewind/osu-pixi/classic-components";

const DEFAULT_SETTINGS: PlayfieldBorderSettings = {
  enabled: true,
  thickness: 2,
};

@injectable()
export class PlayfieldBorderSettingsStore {
  settings$: BehaviorSubject<PlayfieldBorderSettings>;

  constructor() {
    this.settings$ = new BehaviorSubject<PlayfieldBorderSettings>(DEFAULT_SETTINGS);
  }

  get settings() {
    return this.settings$.getValue();
  }
}
