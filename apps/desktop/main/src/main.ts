import { app, BrowserWindow, dialog, Menu, screen, shell } from "electron";
import { setupEventListeners } from "./app/events";
import { readRewindElectronSettings, RewindElectronSettings } from "./app/config";
import { initializeAutoUpdater } from "./app/updater";
import { windows } from "./app/windows";
import { join } from "path";
import { format } from "url";
import { environment } from "./environments/environment";

const { ELECTRON_IS_DEV } = process.env;

// TODO: Refactor ???
function isDevelopmentMode() {
  if (ELECTRON_IS_DEV) return true;
  return !environment.production;
}

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;
const MIN_WIDTH = 1024;
const MIN_HEIGHT = 600;

const rendererAppDevPort = 4200;

/**
 * The folder tree inside the Electron application will approximately look like as follows:
 *
 * ./main/main.js [THIS FILE]
 * ./frontend/(index.html|main.js)
 * ./frontend/preload.js
 * ./backend/(index.html|main.js)
 * ./backend/preload.js
 */
const desktopFrontendFile = (fileName: string) => join(__dirname, "..", "frontend", fileName);
const desktopBackendFile = (fileName: string) => join(__dirname, "..", "backend", fileName);

const desktopFrontendPreloadPath = desktopFrontendFile("preload.js");
const desktopBackendPreloadPath = desktopBackendFile("preload.js");

// Probably this should work differently
let frontendIsQuitting = false;

function createFrontendWindow(settings: RewindElectronSettings) {
  const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(DEFAULT_WIDTH, workAreaSize.width || DEFAULT_WIDTH);
  const height = Math.min(DEFAULT_HEIGHT, workAreaSize.height || DEFAULT_HEIGHT);
  const minWidth = Math.min(MIN_WIDTH, workAreaSize.width || MIN_WIDTH);
  const minHeight = Math.min(MIN_HEIGHT, workAreaSize.height || MIN_HEIGHT);

  const frontend = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    show: false,
    webPreferences: {
      contextIsolation: true,
      backgroundThrottling: true, // This MUST be true in order for PageVisibility API to work.
      preload: desktopFrontendPreloadPath,
    },
  });
  frontend.center();
  frontend.on("ready-to-show", () => {
    windows.frontend?.show();
  });
  frontend.on("closed", () => {
    windows.frontend = null;
    app.quit();
    // Otherwise we won't trigger all windows closed
    windows.backend?.close();
  });
  // Open external links such as socials in the default browser.
  frontend.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });
  frontend.setMenu(createMenu(settings.osuPath));

  // In DEV mode we want to utilize hot reloading, therefore we are going to connect to the development server.
  // Therefore, `nx run frontend:serve` must be run first before this is executed.
  if (isDevelopmentMode()) {
    void frontend.loadURL(`http://localhost:${rendererAppDevPort}`);
  } else {
    void frontend.loadURL(
      format({
        pathname: desktopFrontendFile("index.html"),
        protocol: "file:",
        slashes: true,
      }),
    );
  }

  windows.frontend = frontend;
}

function handleAllWindowClosed() {
  // On macOS it's common that the application stays open and can be reactivated.
  if (process.platform !== "darwin") {
    app.quit();
  }
}

function createBackendWindow() {
  const backend = new BrowserWindow({
    // Showing this allows us to access the console
    // Or maybe find out how to use it with a node.js debugger?
    show: isDevelopmentMode(),
    webPreferences: {
      devTools: true,
      // We can be a little bit reckless here because we don't load remote content in the backend.
      contextIsolation: false,
      nodeIntegration: true,
      preload: desktopBackendPreloadPath,
    },
  });
  backend.on("close", (e) => {
    // We don't close
    windows.backend?.hide();
    if (!frontendIsQuitting) {
      e.preventDefault();
    } else {
      windows.backend = null;
    }
  });
  backend.webContents.openDevTools();
  void backend.loadURL(
    format({
      pathname: desktopBackendFile(join("assets", "index.html")),
      protocol: "file:",
      slashes: true,
    }),
  );

  windows.backend = backend;
}

function handleReady() {
  const userDataPath = app.getPath("userData");
  const settings = readRewindElectronSettings(userDataPath);

  const isDev = isDevelopmentMode();

  console.log(
    "Booting Electron application with settings: ",
    JSON.stringify({
      settings,
      isDev,
      appDataPath: app.getPath("appData"),
    }),
  );

  createFrontendWindow(settings);
  createBackendWindow();
}

function handleActivate() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.frontend === null) {
    handleReady();
  }
}

function handleBeforeQuit() {
  // TODO:
  frontendIsQuitting = true;
}

(function main() {
  // Make sure that it's only started once for now. In the future we might allow multiple instances to run at the
  // same time. Current problem is that the backend would also start twice...
  const isLocked = app.requestSingleInstanceLock();
  if (!isLocked) app.quit();

  // Required for `electron.Notification` to work
  app.setAppUserModelId("sh.abstrakt.rewind");

  // So that the audio can't be stopped with media keys
  app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling");

  initializeAutoUpdater();
  setupEventListeners();

  app.on("window-all-closed", handleAllWindowClosed);
  app.on("ready", handleReady);
  app.on("activate", handleActivate);
  app.on("before-quit", handleBeforeQuit);
})();

// This is only good for Windows/Linux
function createMenu(osuFolder: string | null) {
  const osuFolderKnown = !!osuFolder as boolean;

  return Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open Replay",
          accelerator: "CommandOrControl+O",
          enabled: osuFolderKnown,
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              defaultPath: join(osuFolder ?? "", "Replays"),
              properties: ["openFile"],
              filters: [
                { name: "osu! Replay", extensions: ["osr"] },
                { name: "All Files", extensions: ["*"] },
              ],
            });
            if (!canceled && filePaths.length > 0) {
              const file = filePaths[0];
              windows.frontend?.webContents.send("onManualReplayOpen", file);
            }
          },
        },
        { type: "separator" },
        {
          label: "Open Installation Folder",
          click: async () => {
            await shell.showItemInFolder(app.getPath("exe"));
          },
        },
        {
          label: "Open User Config Folder",
          click: async () => {
            await shell.openPath(app.getPath("userData"));
          },
        },
        {
          label: "Open Logs Folder",
          click: async () => {
            await shell.openPath(app.getPath("logs"));
          },
        },
        { type: "separator" },
        {
          label: "Open osu! Folder",
          click: async () => {
            if (osuFolder) await shell.openPath(osuFolder);
          },
          enabled: osuFolderKnown,
        },
        { type: "separator" },
        { role: "close" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "toggleDevTools" },
        { label: "Open Backend", click: () => windows.backend?.show() },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: async () => {
            await shell.openExternal("https://github.com/abstrakt8/rewind/wiki");
          },
        },
        {
          label: "Discord",
          click: async () => {
            await shell.openExternal("https://discord.gg/QubdHdnBVg");
          },
        },
        { type: "separator" },
        {
          label: "About",
          click: async () => {
            const aboutMessage = `Rewind ${app.getVersion()}\nDeveloped by abstrakt`;
            await dialog.showMessageBox({
              title: "About Rewind",
              type: "info",
              message: aboutMessage,
              // TODO: icon: NativeImage (RewindIcon)
            });
          },
        },
      ],
    },
  ]);
}
