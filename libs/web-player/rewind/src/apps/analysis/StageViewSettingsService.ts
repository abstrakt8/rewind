import type { ViewSettings } from "../../model/ViewSettings";
import { inject, injectable } from "inversify";
import { STAGE_TYPES } from "../../types/STAGE_TYPES";

// TODO: LocalStorage ?
// rxjs?
@injectable()
export class StageViewSettingsService {
  private view: ViewSettings;

  constructor(@inject(STAGE_TYPES.INITIAL_VIEW_SETTINGS) initialViewSettings: ViewSettings) {
    this.view = initialViewSettings;
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
