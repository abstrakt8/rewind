import { ModuleRef, NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { OSU_FOLDER } from "../../common/src/constants";
import { join } from "path";
import { ApiCommonModule, LocalBlueprintService } from "@rewind/api/common";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { ReplayWatcher } from "../../common/src/replays/ReplayWatcher";
import { osuFolderSanityCheck } from "./config/utils";
import { DesktopConfigService, REWIND_CFG_PATH } from "./config/DesktopConfigService";
import { DesktopConfigController } from "./config/DesktopConfigController";

const globalPrefix = "/api";
const REWIND_CFG_NAME = "rewind.cfg";

interface Settings {
  // Usually %APPDATA% on Windows
  applicationDataPath: string;
}

interface NormalBootstrapSettings {
  osuFolder: string;
}

const port = process.env.PORT || 7271;

function listenCallback() {
  Logger.log(`Listening at http://localhost:${port}${globalPrefix}`);
}

/**
 * The usual bootstrap happens with the concrete knowledge of the osu! folder. Only at the first start up of the
 * application we will have to refer to boot differently.
 */
async function normalBootstrap(osuFolder: string) {
  Logger.log("Bootstrapping normally");
  // Find out osu! folder through settings
  const osuFolderProvider = {
    provide: OSU_FOLDER,
    useValue: osuFolder,
  };

  @Module({
    imports: [ApiCommonModule],
    providers: [osuFolderProvider],
  })
  class RewindDesktopModule implements OnModuleInit {
    constructor(private moduleRef: ModuleRef) {}

    async onModuleInit(): Promise<void> {
      const [osuFolder, replayWatcher, localBlueprintService] = await Promise.all([
        this.moduleRef.resolve(OSU_FOLDER),
        this.moduleRef.resolve(ReplayWatcher),
        this.moduleRef.resolve(LocalBlueprintService),
      ]);
      replayWatcher.watchForReplays(join(osuFolder, "Replays"));
      localBlueprintService.getAllBlueprints().then(() => Logger.log("Loaded all blueprints."));
      // TODO: Emit and then set the status to booted
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(RewindDesktopModule, {});

  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  app.useStaticAssets(join(osuFolder, "Skins"), { prefix: "/static/skins" });
  app.useStaticAssets(join(osuFolder, "Songs"), { prefix: "/static/songs" });
  // app.useStaticAssets("E:\\osu!\\Replays", { prefix: "/static/replays" });
  // app.useStaticAssets("E:\\osu!\\Data\\r", { prefix: "/static/replays" });

  // TODO TODO TODO getAllBlueprints() should store a state "IS_LOADING"
  // const localBlueprintService = app.get(LocalBlueprintService);
  // localBlueprintService.getAllBlueprints().then(() => Logger.log("Loaded all blueprints."));

  // const replayWatcher = app.get(ReplayWatcher);
  // replayWatcher.watchForReplays(join(osuFolder, "Replays"));

  await app.listen(port, listenCallback);
  // return () => app.close();
}

interface SetupBootstrapSettings {
  applicationDataPath: string;
}

export async function setupBootstrap({ applicationDataPath }: SetupBootstrapSettings) {
  Logger.log("Setup bootstrap started");

  const rewindCfgPath = join(applicationDataPath, REWIND_CFG_NAME);
  const rewindCfgProvider = {
    provide: REWIND_CFG_PATH,
    useValue: rewindCfgPath,
  };

  @Module({
    providers: [rewindCfgProvider, DesktopConfigService],
    controllers: [DesktopConfigController],
  })
  class SetupModule {}

  const app = await NestFactory.create<NestExpressApplication>(SetupModule);
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  await app.listen(port, listenCallback);
  return app;
}

export async function bootstrapRewindDesktopBackend({ applicationDataPath }: Settings) {
  const osuFolder = "E:\\!";
  const folderSanityCheckPassed = await osuFolderSanityCheck(osuFolder);

  if (folderSanityCheckPassed) {
    return normalBootstrap(osuFolder);
  } else {
    return setupBootstrap({ applicationDataPath });
  }
}
