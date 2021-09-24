import { Skin } from "../../model/Skin";
import { injectable } from "inversify";

@injectable()
export class SkinManager {
  private skin: Skin;

  constructor() {
    this.skin = Skin.EMPTY;
  }

  getSkin(): Skin {
    return this.skin;
  }

  setSkin(skin: Skin) {
    this.skin = skin;
  }
}
