import { makeAutoObservable } from "mobx";
import { AnalysisCursorSetting, OsuCursorSetting, ViewSettings } from "../ViewSettings";
import { Skin } from "../skins/Skin";
import { SkinStore } from "./SkinStore";

// Domain object
export class RenderSettings implements ViewSettings {
  showFps = true;
  analysisCursor: AnalysisCursorSetting = {
    scale: 0.8,
    enabled: false,
    scaleWithCS: true,
    colorBothKeys: 0x333456,
    colorKey1: 0xaffede,
    colorKey2: 0xdeadbe,
  };
  backgroundDim = 0.5;
  modHidden = false;
  osuCursor: OsuCursorSetting = {
    showTrail: true,
    scale: 0.8,
    enabled: true,
    scaleWithCS: true,
  };
  playfieldBorder = { thickness: 2, enabled: true };
  skin = Skin.EMPTY;

  constructor(private readonly skinStore: SkinStore) {
    makeAutoObservable(this);
  }

  toggleModHidden(): void {
    this.modHidden = !this.modHidden;
  }

  async changeSkin(skinId: string): Promise<void> {
    this.skin = await this.skinStore.loadSkin(skinId);
  }
}
