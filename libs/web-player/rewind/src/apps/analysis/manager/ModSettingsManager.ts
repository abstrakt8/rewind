import { AnalysisModSettings } from "../settings/AnalysisModSettings";
import { injectable } from "inversify";

@injectable()
export class ModSettingsManager {
  modSettings: AnalysisModSettings = {
    flashlight: false,
    hidden: false,
  };

  setHidden(hidden: boolean) {
    this.modSettings.hidden = hidden;
  }
}
