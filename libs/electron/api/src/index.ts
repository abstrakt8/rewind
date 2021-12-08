interface UpdateInfo {
  total: number;
  transferred: number;
  bytesPerSecond: number;
}

export interface FrontendPreloadAPI {
  // Renderer -> Main process
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>; // actually return type is `NodeJS.Platform`
  selectDirectory: (defaultPath: string) => Promise<string | null>;
  selectFile: (defaultPath: string) => Promise<string | null>;
  reboot: () => void;

  startDownloadingUpdate: () => void;

  // Main process -> Renderer
  onUpdateDownloadProgress: (listener: (updateInfo: UpdateInfo) => any) => any;
  onManualReplayOpen: (listener: (file: string) => any) => any;
  onUpdateAvailable: (listener: (version: string) => any) => any;
  onDownloadFinished: (listener: () => any) => any;
}

type PathType = "appData" | "userData" | "appResources" | "logs";

export interface BackendPreloadAPI {
  getPath: (type: PathType) => Promise<string>;
}
