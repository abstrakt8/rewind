import type { ViewSettings } from "./ViewSettings";
import { inject, injectable } from "inversify";
import { STAGE_TYPES } from "../STAGE_TYPES";

// TODO: LocalStorage ?
@injectable()
export class StageViewService {
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
}