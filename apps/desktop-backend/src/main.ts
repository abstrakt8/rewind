import { bootstrapRewindDesktopBackend, RewindBootstrapSettings } from "@rewind/api/desktop";
import { BackendPreloadAPI } from "@rewind/electron/api";

import { environment } from "./environments/environment";

declare global {
  interface Window {
    settings: BackendPreloadAPI;
  }
}

const isDevMode = !environment.production;

async function getSettings(): Promise<RewindBootstrapSettings> {
  if (isDevMode) {
    return {
      userDataPath: environment.userDataPath,
      appDataPath: environment.appDataPath,
      appResourcesPath: environment.appResourcesPath,
      logDirectory: environment.logDirectory,
    };
  } else {
    const [userDataPath, appDataPath, appResourcesPath, logDirectory] = await Promise.all([
      window.settings.getPath("userData"),
      window.settings.getPath("appData"),
      window.settings.getPath("appResources"),
      window.settings.getPath("logs"),
    ]);

    return {
      userDataPath,
      appDataPath,
      appResourcesPath,
      logDirectory,
    };
  }
}

getSettings().then((s) => bootstrapRewindDesktopBackend(s));
