import { defaultViewSettings, ViewSettings } from "../../../game/ViewSettings";

export class TheaterViewService {
  private view: ViewSettings;

  constructor() {
    this.view = defaultViewSettings();
  }

  getView() {
    return this.view;
  }

  changeView(view: ViewSettings) {
    this.view = view;
  }
}
