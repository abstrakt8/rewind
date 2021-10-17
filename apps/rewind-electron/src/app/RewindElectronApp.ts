import { BrowserWindow, dialog, Menu, screen, shell } from "electron";
import { join } from "path";
import { format } from "url";

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;
const MIN_WIDTH = 1024;
const MIN_HEIGHT = 600;

const rendererAppName = "desktop-frontend";
const rendererAppDevPort = 4200;

const desktopFrontendPreload = join(__dirname, "..", "desktop-frontend-preload", "main.js");
const desktopBackendPreload = join(__dirname, "..", "desktop-backend-preload", "main.js");

export class RewindElectronApp {
  mainWindow?: BrowserWindow;
  apiWindow?: BrowserWindow;
  isQuitting = false;

  constructor(readonly application: Electron.App, private readonly isDevMode = false) {}

  createMainWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(DEFAULT_WIDTH, workAreaSize.width || DEFAULT_WIDTH);
    const height = Math.min(DEFAULT_HEIGHT, workAreaSize.height || DEFAULT_HEIGHT);
    const minWidth = Math.min(MIN_WIDTH, workAreaSize.width || MIN_WIDTH);
    const minHeight = Math.min(MIN_HEIGHT, workAreaSize.height || MIN_HEIGHT);

    this.mainWindow = new BrowserWindow({
      width,
      height,
      minWidth,
      minHeight,
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
          submenu: [
            { label: "Open Replay", accelerator: "CommandOrControl+O", enabled: false },
            { type: "separator" },
            {
              label: "Open Installation Folder",
              click: async () => {
                await shell.showItemInFolder(this.application.getPath("exe"));
              },
            },
            {
              label: "Open User Config Folder",
              click: async () => {
                await shell.openPath(this.application.getPath("userData"));
              },
            },
            {
              label: "Open Logs Folder",
              click: async () => {
                await shell.openPath(this.application.getPath("logs"));
              },
            },
            { type: "separator" },
            {
              label: "Open osu! Folder",
              click: async () => {
                // TODO: !!!
                await shell.openPath("E:\\osu!");
              },
              enabled: false,
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
            { label: "Open Backend", click: async () => this.apiWindow?.show() },
          ],
        },
        {
          label: "Help",
          submenu: [
            {
              label: "Documentation",
              click: async () => {
                await shell.openExternal("https://bit.ly/3BOF3P2");
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
                const aboutMessage = `Rewind ${this.application.getVersion()}\nDeveloped by abstrakt\nPartnered with osu! University`;
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
      ]),
    );
    // this.mainWindow.setMenuBarVisibility(false);

    this.mainWindow.on("closed", () => {
      this.mainWindow = undefined;
      this.application.quit();
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
    this.apiWindow.on("close", (e) => {
      // We don't close
      this.apiWindow?.hide();
      if (!this.isQuitting) {
        e.preventDefault();
      } else {
        this.apiWindow = undefined;
      }
    });
    // if (this.isDevMode) {
    this.apiWindow.webContents.openDevTools();
    // }
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
    this.application.on("before-quit", () => (this.isQuitting = true));
  }
}
