import { defaultViewSettings, ViewSettings } from "../../../game/ViewSettings";
import { injectable } from "inversify";

@injectable()
export class StageViewService {
  private view: ViewSettings;

  constructor(defaultViewSettings: ViewSettings) {
    this.view = defaultViewSettings;
  }

  getView() {
    return this.view;
  }

  // I don't think it will ever happen that something within the app will change the view settings.
  // It will ONLY happen through something external like an UI.
  changeView(view: ViewSettings) {
    this.view = view;
  }
}
