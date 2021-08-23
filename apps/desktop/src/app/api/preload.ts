import { contextBridge, ipcRenderer } from "electron";
import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../../../../api/src/app/app.module";
import { OSU_FOLDER } from "../../../../api/src/app/constants";
import { LocalBlueprintService } from "../../../../api/src/app/blueprints/LocalBlueprintService";
import { Logger } from "@nestjs/common";
import { ReplayWatcher } from "../../../../api/src/app/replays/ReplayWatcher";

// TODO: Clean up this mess

contextBridge.exposeInMainWorld("electron", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  platform: process.platform,
});

// Source: https://github.com/electron/electron/issues/9920#issuecomment-575839738
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

const globalPrefix = "api";

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  const osuFolder = app.get(OSU_FOLDER) as string;
  app.useStaticAssets(join(osuFolder, "Skins"), { prefix: "/static/skins" });
  app.useStaticAssets(join(osuFolder, "Songs"), { prefix: "/static/songs" });
  // app.useStaticAssets("E:\\osu!\\Replays", { prefix: "/static/replays" });
  // app.useStaticAssets("E:\\osu!\\Data\\r", { prefix: "/static/replays" });

  // TODO TODO TODO getAllBlueprints() should store a state "IS_LOADING"
  const localBlueprintService = app.get(LocalBlueprintService);
  localBlueprintService.getAllBlueprints().then(() => Logger.log("Loaded all blueprints."));

  const replayWatcher = app.get(ReplayWatcher);
  replayWatcher.watchForReplays(join(osuFolder, "Replays"));

  const port = process.env.PORT || 7271;
  await app.listen(port, () => {
    Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
  });
}

contextBridge.exposeInMainWorld("desktopApi", {
  boot: () => {
    bootstrap().then(() => {
      console.log("Successfully booted");
    });
  },
});
