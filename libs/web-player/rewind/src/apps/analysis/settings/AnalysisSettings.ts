import { AnalysisCursorSetting } from "./AnalysisCursorSetting";

/**
 * Persistent settings that I would only consider in the analyzer app.
 *
 * For example ModHiddenEnable should not be considered here since it can also be useful in other applications.
 */

export interface AnalysisSettings {
  sliderDebug: boolean;
  analysisCursor: AnalysisCursorSetting;

  showUnstableRate: boolean;
}
