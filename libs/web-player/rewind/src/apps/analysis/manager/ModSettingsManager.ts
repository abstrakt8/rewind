import { AnalysisModSettings } from "../settings/AnalysisModSettings";
import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";

@injectable()
export class ModSettingsManager {
  modSettings$: BehaviorSubject<AnalysisModSettings>;

  constructor() {
    this.modSettings$ = new BehaviorSubject<AnalysisModSettings>({
      flashlight: false,
      hidden: false,
    });
  }

  get modSettings() {
    return this.modSettings$.getValue();
  }

  setHidden(hidden: boolean) {
    this.modSettings$.next({ ...this.modSettings, hidden });
  }

  setFlashlight(flashlight: boolean) {
    this.modSettings$.next({ ...this.modSettings, flashlight });
  }
}
