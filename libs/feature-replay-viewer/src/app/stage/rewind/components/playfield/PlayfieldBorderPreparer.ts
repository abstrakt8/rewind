import { injectable } from "inversify";
import { PlayfieldBorder } from "@rewind/osu-pixi/classic-components";
import { StageViewService } from "../../StageViewService";

@injectable()
export class PlayfieldBorderPreparer {
  private readonly playfieldBorder: PlayfieldBorder;

  constructor(private stageViewService: StageViewService) {
    this.playfieldBorder = new PlayfieldBorder();
  }

  getGraphics() {
    return this.playfieldBorder.graphics;
  }

  prepare() {
    const { playfieldBorder } = this.stageViewService.getView();
    this.playfieldBorder.prepare(playfieldBorder);
  }
}
