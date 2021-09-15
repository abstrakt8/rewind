export interface FrontendPreloadAPI {
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>; // actually NodeJS.Platform
  selectDirectory: (defaultPath: string) => Promise<string | null>;
  reboot: () => void;
}

type PathType = "appData" | "userData" | "appResources" | "logs";

export interface BackendPreloadAPI {
  getPath: (type: PathType) => Promise<string>;
}
