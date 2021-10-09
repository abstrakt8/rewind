export interface KeyPressOverlaySettings {
  // The key presses that are relative to [-timeWindow+currentTime, currentTime+timeWindow] will be shown
  timeWindow: number;

  // Number between 0 and 1 determining the opacity of the right hand side
  futureOpacity: number;
}
