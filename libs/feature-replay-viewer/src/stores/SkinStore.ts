import { makeAutoObservable } from "mobx";
import { Skin } from "../skins/Skin";
import { OsuExpressSkinManager } from "../skins/SkinManager";

class LocalSkin {}

export class SkinStore {
  skins: Record<string, Skin>;

  constructor() {
    makeAutoObservable(this);
    this.skins = {};
  }

  resolveSkin(id: string): Skin | undefined {
    return this.skins[id];
  }

  clearCache() {
    this.skins = {};
  }

  async loadSkin(skinId: string): Promise<Skin> {
    return (this.skins[skinId] = await new OsuExpressSkinManager("http://localhost:7271").loadSkin(skinId));
  }
}
