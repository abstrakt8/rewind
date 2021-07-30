import { Injectable } from "@nestjs/common";
import { SkinFolderReader } from "@rewind/osu/skin-local";
import { Skin } from "./skin.model";

@Injectable()
export class SkinService {
  constructor() {
    return;
  }

  get skinFolderPath(): string {
    return "E:\\osu!\\Skins";
  }

  async allSkinsInFolder(): Promise<Skin[]> {
    const skinIds = await SkinFolderReader.listSkinsInFolder(this.skinFolderPath, { skinIniRequired: true });
    return skinIds.map((id) => {
      const skin = new Skin();
      skin.id = id;
      // skin.files = []; // ?
      return skin;
    });
  }
}
