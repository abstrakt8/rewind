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
    };
  } else {
    const [userDataPath, appDataPath, appResourcesPath] = await Promise.all([
      window.settings.getUserDataPath(),
      window.settings.getAppDataPath(),
      window.settings.getAppResourcesPath(),
    ]);

    return {
      userDataPath,
      appDataPath,
      appResourcesPath,
    };
  }
}

getSettings().then((s) => bootstrapRewindDesktopBackend(s));
