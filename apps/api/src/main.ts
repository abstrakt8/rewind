/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app/app.module";
import { OSU_FOLDER } from "./app/constants";
import { ReplayWatcher } from "./app/replays/ReplayWatcher";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  const osuFolder = app.get(OSU_FOLDER) as string;
  app.useStaticAssets(join(osuFolder, "Skins"), { prefix: "/static/skins" });
  app.useStaticAssets(join(osuFolder, "Songs"), { prefix: "/static/songs" });
  // app.useStaticAssets("E:\\osu!\\Replays", { prefix: "/static/replays" });
  // app.useStaticAssets("E:\\osu!\\Data\\r", { prefix: "/static/replays" });

  const replayWatcher = app.get(ReplayWatcher);
  replayWatcher.watchForReplays(join(osuFolder, "Replays"));

  const port = process.env.PORT || 7271;
  await app.listen(port, () => {
    Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
  });
}

bootstrap().then(() => {
  Logger.log("Successfully bootstrapped.");
});
