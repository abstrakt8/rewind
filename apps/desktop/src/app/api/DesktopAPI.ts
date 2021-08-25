import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { OSU_FOLDER } from "../../../../../libs/api/common/src/constants";
import { join } from "path";
import { LocalBlueprintService } from "@rewind/api/common";
import { Logger } from "@nestjs/common";
import { ReplayWatcher } from "../../../../../libs/api/common/src/replays/ReplayWatcher";
import { Module } from "@nestjs/common";
import { ApiCommonModule } from "@rewind/api/common";

@Module({
  imports: [ApiCommonModule],
  controllers: [],
  providers: [],
})
export class RewindDesktopModule {}

const globalPrefix = "/api";

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(RewindDesktopModule);
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

bootstrap().then(() => {
  Logger.log("Successfully bootstrapped.");
});
