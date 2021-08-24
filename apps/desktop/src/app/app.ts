import { BrowserWindow, screen, shell } from "electron";
import { rendererAppName, rendererAppPort } from "./constants";
import { environment } from "../environments/environment";
import { join } from "path";
import { format } from "url";

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow;
  static apiWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = "ELECTRON_IS_DEV" in process.env;
    const getFromEnvironment: boolean = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

  private static onWindowAllClosed() {
    if (process.platform !== "darwin") {
      App.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    App.mainWindow = null;
  }

  private static onRedirect(event: any, url: string) {
    if (url !== App.mainWindow.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    App.initAPIWindow();
    App.loadAPIWindow();
    // TODO: Should we wait until the API has finished loading?
    App.initMainWindow();
    App.loadMainWindow();
  }

  private static onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onReady();
    }
  }

  private static initMainWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(1280, workAreaSize.width || 1280);
    const height = Math.min(720, workAreaSize.height || 720);

    // Create the browser window.
    App.mainWindow = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      // frame: false, // TODO: to make it look like Discord/VSCode we need custom titlebar
      webPreferences: {
        devTools: true,
        contextIsolation: true,
        // backgroundThrottling: false,
        backgroundThrottling: true, // TODO: Should this be true since we want to throttle when it is in the background
        // preload: join(__dirname, "preload.js"),
      },
    });
    App.mainWindow.setMenu(null);
    App.mainWindow.center();

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once("ready-to-show", () => {
      App.mainWindow.show();
    });

    // handle all external redirects in a new browser window
    // App.mainWindow.webContents.on('will-navigate', App.onRedirect);
    // App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    //     App.onRedirect(event, url);
    // });

    // Emitted when the window is closed.
    App.mainWindow.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null;
    });
  }

  private static loadMainWindow() {
    // load the index.html of the app.
    if (!App.application.isPackaged) {
      App.mainWindow.loadURL(`http://localhost:${rendererAppPort}`);
    } else {
      App.mainWindow.loadURL(
        format({
          pathname: join(__dirname, "..", rendererAppName, "index.html"),
          // protocol: "file:",
          // slashes: true,
        }),
      );
    }
  }

  private static initAPIWindow() {
    // Since the API is a node.js app we want to include `nodeIntegration`
    App.apiWindow = new BrowserWindow({
      show: this.isDevelopmentMode(), // Showing this allows us to access the console
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: join(__dirname, "preload.js"),
      },
    });
  }

  private static loadAPIWindow() {
    // if (!app.application.ispackaged) {
    //   // app.apiwindow.loadurl(`http://localhost:${rendererapiport}`);
    // } else {
    App.apiWindow.loadURL(
      format({
        pathname: join(__dirname, "assets", "index.html"),
        protocol: "file:",
        slashes: true,
      }),
    );
    // );
    // }
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for

    App.BrowserWindow = browserWindow;
    App.application = app;

    App.application.on("window-all-closed", App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on("ready", App.onReady); // App is ready to load data
    App.application.on("activate", App.onActivate); // App is activated
  }
}
