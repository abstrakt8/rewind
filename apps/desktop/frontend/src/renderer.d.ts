import { FrontendPreloadAPI } from "@rewind/electron/api";

// This is exposed via:
// contextBridge.exposeInMainWorld("api", frontendAPI);

declare global {
  interface Window {
    api: FrontendPreloadAPI;
  }
}
