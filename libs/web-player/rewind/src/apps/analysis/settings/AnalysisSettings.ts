import { AnalysisCursorSettings } from "../../../settings/AnalysisCursorSettings";

/**
 * Persistent settings that I would only consider in the analyzer app.
 *
 * For example ModHiddenEnable should not be considered here since it can also be useful in other applications.
 */

export interface AnalysisSettings {
  sliderDebug: boolean;
  analysisCursor: AnalysisCursorSettings;

  showUnstableRate: boolean;
}
