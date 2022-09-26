import { app, BrowserWindow, dialog, ipcMain, Menu, screen, shell } from "electron";
import { setupEventListeners } from "./app/events";
import { windows } from "./app/windows";
import { join } from "path";
import { format } from "url";
import { environment } from "./environments/environment";
import log from "electron-log";

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
 * ./index.js [THIS FILE]
 * ./frontend/(index.html|main.js|...)
 */
const desktopFrontendFile = (fileName: string) => join(__dirname, "frontend", fileName);

function createFrontendWindow() {
  const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(DEFAULT_WIDTH, workAreaSize.width || DEFAULT_WIDTH);
  const height = Math.min(DEFAULT_HEIGHT, workAreaSize.height || DEFAULT_HEIGHT);
  const minWidth = Math.min(MIN_WIDTH, workAreaSize.width || MIN_WIDTH);
  const minHeight = Math.min(MIN_HEIGHT, workAreaSize.height || MIN_HEIGHT);

  const isDev = isDevelopmentMode();
  const frontend = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    show: false,
    webPreferences: {
      // `webSecurity` disabled while developing, otherwise we can't do hot reloading conveniently
      // https://stackoverflow.com/questions/50272451/electron-js-images-from-local-file-system
      webSecurity: !isDev,
      // This MUST be true in order for PageVisibility API to work.
      backgroundThrottling: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  frontend.center();
  frontend.on("ready-to-show", () => {
    windows.frontend?.show();
  });
  frontend.on("closed", () => {
    windows.frontend = null;
    app.quit();
  });
  // Open external links such as socials in the default browser.
  frontend.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });

  ipcMain.on("osuFolderChanged", (event, folder: string) => {
    // TODO: frontend.setMenu()
    Menu.setApplicationMenu(createMenu(folder));
  });

  // In DEV mode we want to utilize hot reloading, therefore we are going to connect to the development server.
  // Therefore, `nx run frontend:serve` must be run first before this is executed.
  if (isDev) {
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

function handleReady() {
  const isDev = isDevelopmentMode();

  Menu.setApplicationMenu(createMenu(null));

  console.log(
    "Booting Electron application with settings: ",
    JSON.stringify({
      isDev,
      appDataPath: app.getPath("appData"),
    }),
  );

  createFrontendWindow();
}

function handleActivate() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.frontend === null) {
    handleReady();
  }
}

(function main() {
  // Recommended way to use electron-log whenever we write console.log
  Object.assign(console, log.functions);

  // Make sure that it's only started once
  const isLocked = app.requestSingleInstanceLock();
  if (!isLocked) app.quit();

  // Required for `electron.Notification` to work
  app.setAppUserModelId("sh.abstrakt.rewind");

  // https://peter.sh/experiments/chromium-command-line-switches/
  // So that the audio can't be stopped with media keys
  app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling");

  // Even though some GPUs might be "crashy" (see
  // https://chromium.googlesource.com/chromium/src/gpu/+/master/config/software_rendering_list.json), we still want to
  // use it instead of rendering a power-point presentation.
  app.commandLine.appendSwitch("ignore-gpu-blocklist");

  // TODO: Enable this once it's implemented properly
  // initializeAutoUpdater();
  setupEventListeners();

  app.on("window-all-closed", handleAllWindowClosed);
  app.on("ready", handleReady);
  app.on("activate", handleActivate);
})();

function createMenu(osuFolder: string | null) {
  const osuFolderKnown = !!osuFolder as boolean;
  const isMac = process.platform === "darwin";

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [];
  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        {
          role: "about",
          label: "About",
        },
        {
          type: "separator",
        },
        {
          role: "services",
          label: "Services",
        },
        {
          type: "separator",
        },
        {
          role: "hide",
          label: "Hide",
        },
        {
          role: "hideOthers",
          label: "Hide Others",
        },
        {
          role: "unhide",
          label: "Unhide",
        },
        {
          type: "separator",
        },
        {
          role: "quit",
          label: "Quit",
        },
      ],
    });
  }

  template.push(
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
      submenu: [{ role: "reload" }, { role: "forceReload" }, { type: "separator" }, { role: "toggleDevTools" }],
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
  );

  return Menu.buildFromTemplate(template);
}
