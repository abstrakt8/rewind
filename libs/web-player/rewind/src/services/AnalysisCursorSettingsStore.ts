import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { AnalysisCursorSettings, DEFAULT_ANALYSIS_CURSOR_SETTINGS } from "../settings/AnalysisCursorSettings";
import { injectable } from "inversify";

@injectable()
export class AnalysisCursorSettingsStore extends AbstractSettingsStore<AnalysisCursorSettings> {
  constructor() {
    super(DEFAULT_ANALYSIS_CURSOR_SETTINGS);
  }

  setEnabled(enabled: boolean) {
    this.changeSettings((s) => (s.enabled = enabled));
  }
}
