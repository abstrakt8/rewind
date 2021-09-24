import { injectable } from "inversify";
import { PlayfieldBorder } from "@rewind/osu-pixi/classic-components";
import { StageViewSettingsService } from "../../../apps/analysis/StageViewSettingsService";

@injectable()
export class PlayfieldBorderPreparer {
  private readonly playfieldBorder: PlayfieldBorder;

  constructor(private stageViewService: StageViewSettingsService) {
    this.playfieldBorder = new PlayfieldBorder();
  }

  getGraphics() {
    return this.playfieldBorder.graphics;
  }

  update() {
    const { playfieldBorder } = this.stageViewService.getView();
    this.playfieldBorder.prepare(playfieldBorder);
  }
}
