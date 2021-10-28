export interface FrontendPreloadAPI {
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>; // actually NodeJS.Platform
  selectDirectory: (defaultPath: string) => Promise<string | null>;
  selectFile: (defaultPath: string) => Promise<string | null>;
  reboot: () => void;
  onManualReplayOpen: (listener: (file: string) => any) => any;
}

type PathType = "appData" | "userData" | "appResources" | "logs";

export interface BackendPreloadAPI {
  getPath: (type: PathType) => Promise<string>;
}
