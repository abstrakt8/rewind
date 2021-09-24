import { injectable } from "inversify";
import { Skin } from "../model/Skin";

// TODO: Later we should use this approach because it actually allows us to easily toggle on/off something like beatmap
// skin.

@injectable()
export class SkinWithFallbackService {
  constructor() {}

  // Filling any
  defaultSkin?: Skin;
  userSkin?: Skin;
  // beatmapSkin?: Skin;

  // getTexture(texture: OsuSkinTextures) {
  //   // If enabled -> get
  //   if(this.userSkin && this.userSkin.getTexture(te)
  //
  //   return Texture.EMPTY;
  // }
}
