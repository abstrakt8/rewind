export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  platform: string;
}

export const validSendChannels = ["openDirectorySelect", "reboot"] as const;
export type ValidSendChannel = typeof validSendChannels[number];

export const validReceiveChannels = ["directorySelected"] as const;
export type ValidReceiveChannel = typeof validReceiveChannels[number];

type Destroyer = () => void;

export interface SecureElectronAPI {
  send: (channel: ValidSendChannel, ...args: string[]) => void;
  receive: (channel: ValidReceiveChannel, func: (...args: any[]) => void) => Destroyer;
}

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
