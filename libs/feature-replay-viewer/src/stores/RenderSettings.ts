import { makeAutoObservable } from "mobx";
import { defaultViewSettings, ViewSettings } from "../ViewSettings";
import { Skin } from "../skins/Skin";
import { SkinStore } from "./SkinStore";

// Domain object
// showFps = true;
// analysisCursor: AnalysisCursorSetting = {
//   scale: 0.8,
//   enabled: false,
//   scaleWithCS: true,
//   colorBothKeys: 0x333456,
//   colorKey1: 0xaffede,
//   colorKey2: 0xdeadbe,
// };
// backgroundDim = 0.5;
// modHidden = false;
// osuCursor: OsuCursorSetting = {
//   showTrail: true,
//   scale: 0.8,
//   enabled: true,
//   scaleWithCS: true,
// };
// playfieldBorder = { thickness: 2, enabled: true };

export class RenderSettings {
  viewSettings: ViewSettings;
  skin = Skin.EMPTY;

  constructor(private readonly skinStore: SkinStore) {
    makeAutoObservable(this);
    this.viewSettings = defaultViewSettings();
  }

  toggleModHidden(): void {
    this.viewSettings.modHidden = !this.viewSettings.modHidden;
  }

  toggleAnalysisCursor(): void {
    this.viewSettings.analysisCursor.enabled = !this.viewSettings.analysisCursor.enabled;
  }

  async changeSkin(skinId: string): Promise<void> {
    this.skin = await this.skinStore.loadSkin(skinId);
  }
}
