import { BrowserWindow, screen, app } from "electron";
import { join } from "path";
import { format } from "url";
import { environment } from "./environments/environment";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const rendererAppName = "desktop-frontend";
const rendererAppDevPort = 4200;

class RewindElectronApp {
  mainWindow: BrowserWindow;
  apiWindow: BrowserWindow;

  constructor(private application: Electron.App, private readonly isDevMode = false) {}

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
        backgroundThrottling: true, // TODO: Should this be enabled?
        // TODO: Preload
      },
    });
    // this.mainWindow.setMenu(null);
    this.mainWindow.center();
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  createApiWindow() {
    this.apiWindow = new BrowserWindow({
      // Showing this allows us to access the console
      // Or maybe find out how to use it with a node.js debugger?
      show: this.isDevMode,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: join(__dirname, "preload.js"),
      },
    });
  }

  loadApiWindow() {
    this.apiWindow.loadURL(
      format({
        pathname: join(__dirname, "assets", "index.html"),
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
      this.mainWindow.loadURL(`http://localhost:${rendererAppDevPort}`).then(handleFinishedLoading);
    } else {
      this.mainWindow
        .loadURL(
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
    this.createApiWindow();
    this.loadApiWindow();

    this.createMainWindow();
    this.loadMainWindow();
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

function isDevelopmentMode() {
  const isEnvironmentSet: boolean = "ELECTRON_IS_DEV" in process.env;
  const getFromEnvironment: boolean = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
  return isEnvironmentSet ? getFromEnvironment : !environment.production;
}

// TODO: Squirrel events
// TODO: Electron events (?) -> gives app version and exit

const rewindElectronApp = new RewindElectronApp(app, isDevelopmentMode());
rewindElectronApp.boot();
