import { injectable } from "inversify";
import { PlayfieldBorder } from "@rewind/osu-pixi/classic-components";
import { PlayfieldBorderSettingsStore } from "../../../services/PlayfieldBorderSettingsStore";

/**
 * Creates a `PlayfieldBorder` that is connected to the settings store and can adjust its style, thickness based
 * on user input.
 */
@injectable()
export class PlayfieldBorderFactory {
  constructor(private settingsStore: PlayfieldBorderSettingsStore) {}

  createPlayfieldBorder() {
    const playfieldBorder = new PlayfieldBorder();
    // Maybe also subscribes to CS changes
    this.settingsStore.settings$.subscribe((s) => playfieldBorder.onSettingsChange(s));
    return playfieldBorder;
  }
}
