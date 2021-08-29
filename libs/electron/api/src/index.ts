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

export interface BackendPreloadAPI {
  getAppDataPath: () => Promise<string>;
  getUserDataPath: () => Promise<string>;
  getAppResourcesPath: () => Promise<string>;
}
