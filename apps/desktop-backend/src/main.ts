import { bootstrapRewindDesktopBackend } from "@rewind/api/desktop";
import { BackendPreloadAPI } from "@rewind/electron/api";

declare global {
  interface Window {
    settings: BackendPreloadAPI;
  }
}

const isDevMode = process.env.NODE_ENV !== "production";

async function getSettings() {
  if (isDevMode) {
    return {
      userDataPath: "C:\\Users\\me\\Roaming\\AppData\\rewind",
      appDataPath: "C:\\Users\\me\\Roaming\\AppData",
    };
  } else {
    const [userDataPath, appDataPath] = await Promise.all([
      window.settings.getUserDataPath(),
      window.settings.getAppDataPath(),
    ]);

    return {
      userDataPath,
      appDataPath,
    };
  }
}

getSettings().then((s) => bootstrapRewindDesktopBackend(s));
