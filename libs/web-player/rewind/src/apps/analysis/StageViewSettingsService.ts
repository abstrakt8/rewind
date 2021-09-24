import type { ViewSettings } from "../../model/ViewSettings";
import { defaultViewSettings } from "../../model/ViewSettings";
import { injectable } from "inversify";

// TODO: LocalStorage ?
// rxjs?
@injectable()
export class StageViewSettingsService {
  private view: ViewSettings;

  constructor() {
    this.view = defaultViewSettings();
  }

  getView() {
    return this.view;
  }

  // I don't think it will ever happen that something within the app will change the view settings.
  // It will ONLY happen through something external like an UI.
  changeView(view: ViewSettings) {
    this.view = view;
  }

  setModHiddenEnabled(enabled: boolean) {
    this.view.modHidden = enabled;
  }
}
