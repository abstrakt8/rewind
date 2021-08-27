import { ModuleRef, NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import {
  EventsGateway,
  LocalBlueprintController,
  LocalBlueprintService,
  LocalReplayController,
  LocalReplayService,
  OSU_FOLDER,
  OsuDBDao,
  ReplayWatcher,
  SkinController,
  SkinResolver,
  SkinService,
} from "@rewind/api/common";
import { join } from "path";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { osuFolderSanityCheck } from "./config/utils";
import { DesktopConfigService, REWIND_CFG_PATH } from "./config/DesktopConfigService";
import { DesktopConfigController } from "./config/DesktopConfigController";
import { NormalStatusController, SetupStatusController } from "./status/SetupStatusController";
import { EventEmitterModule } from "@nestjs/event-emitter";

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
async function normalBootstrap({ osuFolder, applicationDataPath }: { osuFolder: string; applicationDataPath: string }) {
  Logger.log("Bootstrapping normally");
  // Find out osu! folder through settings
  const osuFolderProvider = {
    provide: OSU_FOLDER,
    useValue: osuFolder,
  };

  const rewindCfgPath = getRewindCfgPath(applicationDataPath);
  const rewindCfgProvider = {
    provide: REWIND_CFG_PATH,
    useValue: rewindCfgPath,
  };

  @Module({
    imports: [EventEmitterModule.forRoot()],
    controllers: [
      LocalReplayController,
      SkinController,
      LocalBlueprintController,
      NormalStatusController,
      DesktopConfigController,
    ],
    providers: [
      rewindCfgProvider,
      osuFolderProvider,
      SkinResolver,
      SkinService,
      EventsGateway,
      ReplayWatcher,
      LocalReplayService,
      LocalBlueprintService,
      OsuDBDao,
      DesktopConfigService,
    ],
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

function getRewindCfgPath(applicationDataPath: string) {
  return join(applicationDataPath, REWIND_CFG_NAME);
}

export async function setupBootstrap({ applicationDataPath }: SetupBootstrapSettings) {
  Logger.log("Setup bootstrap started");

  const rewindCfgPath = getRewindCfgPath(applicationDataPath);
  const rewindCfgProvider = {
    provide: REWIND_CFG_PATH,
    useValue: rewindCfgPath,
  };

  @Module({
    providers: [rewindCfgProvider, DesktopConfigService],
    controllers: [DesktopConfigController, SetupStatusController],
  })
  class SetupModule {}

  const app = await NestFactory.create<NestExpressApplication>(SetupModule);
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  await app.listen(port, listenCallback);
  return app;
}

async function readOsuFolder(applicationDataPath: string): Promise<string | undefined> {
  try {
    const service = new DesktopConfigService(getRewindCfgPath(applicationDataPath));
    const config = await service.loadConfig();
    return config.osuPath;
  } catch (err) {
    return undefined;
  }
}

export async function bootstrapRewindDesktopBackend({ applicationDataPath }: Settings) {
  const osuFolder = await readOsuFolder(applicationDataPath);
  const requiresSetup = osuFolder === undefined || !(await osuFolderSanityCheck(osuFolder));
  if (requiresSetup) {
    return setupBootstrap({ applicationDataPath });
  } else {
    return normalBootstrap({ applicationDataPath, osuFolder });
  }
}
