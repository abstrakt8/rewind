import { BrowserWindow, Menu, screen, shell } from "electron";
import { join } from "path";
import { format } from "url";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const rendererAppName = "desktop-frontend";
const rendererAppDevPort = 4200;

const desktopFrontendPreload = join(__dirname, "..", "desktop-frontend-preload", "main.js");
const desktopBackendPreload = join(__dirname, "..", "desktop-backend-preload", "main.js");

export class RewindElectronApp {
  mainWindow?: BrowserWindow;
  apiWindow?: BrowserWindow;

  constructor(readonly application: Electron.App, private readonly isDevMode = false) {}

  createMainWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(DEFAULT_WIDTH, workAreaSize.width || DEFAULT_WIDTH);
    const height = Math.min(DEFAULT_HEIGHT, workAreaSize.height || DEFAULT_HEIGHT);

    this.mainWindow = new BrowserWindow({
      width,
      height,
      show: true,
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: true, // This MUST be true in order for PageVisibility API to work.
        preload: desktopFrontendPreload,
      },
    });
    this.mainWindow.center();

    this.mainWindow.setMenu(
      Menu.buildFromTemplate([
        {
          label: "File",
          submenu: [{ label: "Open Replay", accelerator: "CommandOrControl+O", enabled: false }, { role: "close" }],
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
                shell.openExternal("https://bit.ly/3BOF3P2");
              },
            },
            {
              label: "Discord",
              click: async () => {
                shell.openExternal("https://discord.gg/QubdHdnBVg");
              },
            },
            {
              label: `Version: ${this.application.getVersion()}`,
              enabled: false,
            },
          ],
        },
      ]),
    );
    // this.mainWindow.setMenuBarVisibility(false);

    this.mainWindow.on("closed", () => {
      this.mainWindow = undefined;
      // Otherwise we won't trigger all windows closed
      this.apiWindow?.close();
    });

    // Open external links such as socials in the default browser.
    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });
  }

  createApiWindow() {
    this.apiWindow = new BrowserWindow({
      // Showing this allows us to access the console
      // Or maybe find out how to use it with a node.js debugger?
      show: this.isDevMode,
      webPreferences: {
        devTools: true,
        // We can be a little bit reckless here because we don't load remote content in the backend.
        contextIsolation: false,
        nodeIntegration: true,
        preload: desktopBackendPreload,
      },
    });
    this.apiWindow.on("close", () => {
      this.apiWindow = undefined;
    });
    if (this.isDevMode) {
      this.apiWindow.webContents.openDevTools();
    }
  }

  loadApiWindow() {
    this.apiWindow?.loadURL(
      format({
        pathname: join(__dirname, "..", "desktop-backend", "assets", "index.html"),
        protocol: "file:",
        slashes: true,
      }),
    );
  }

  loadMainWindow() {
    const handleFinishedLoading = () => console.log("Finished loading");

    // In DEV mode we want to utilize hot reloading, therefore we are going to connect a development server.
    // Therefore `nx run desktop-frontend:serve` must be run first before this is executed.
    if (this.isDevMode) {
      this.mainWindow?.loadURL(`http://localhost:${rendererAppDevPort}`).then(handleFinishedLoading);
    } else {
      this.mainWindow
        ?.loadURL(
          format({
            pathname: join(__dirname, "..", rendererAppName, "index.html"),
            protocol: "file:",
            slashes: true,
          }),
        )
        .then(handleFinishedLoading);
    }
  }

  handleWindowAllClosed() {
    if (process.platform !== "darwin") {
      this.application.quit();
    }
  }

  handleReady() {
    this.createMainWindow();
    this.loadMainWindow();
    this.createApiWindow();
    this.loadApiWindow();
  }

  handleActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (this.mainWindow === null) {
      this.handleReady();
    }
  }

  boot() {
    this.application.on("window-all-closed", () => this.handleWindowAllClosed());
    this.application.on("ready", () => this.handleReady());
    this.application.on("activate", () => this.handleActivate());
  }
}
