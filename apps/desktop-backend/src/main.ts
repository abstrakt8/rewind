import { bootstrapRewindDesktopBackend, RewindBootstrapSettings } from "@rewind/api/desktop";
import { BackendPreloadAPI } from "@rewind/electron/api";

declare global {
  interface Window {
    settings: BackendPreloadAPI;
  }
}

const isDevMode = process.env.NODE_ENV !== "production";

async function getSettings(): Promise<RewindBootstrapSettings> {
  if (isDevMode) {
    return {
      userDataPath: "C:\\Users\\me\\AppData\\Roaming\\rewind",
      appDataPath: "C:\\Users\\me\\AppData\\Roaming",
      appResourcesPath: "C:\\Users\\me\\Dev\\rewind\\resources",
      logDirectory: "C:\\Users\\me\\Dev\\rewind\\logs",
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
