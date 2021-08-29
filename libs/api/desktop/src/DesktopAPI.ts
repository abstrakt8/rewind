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
  SkinNameResolver,
  SkinController,
  SkinService,
  SKIN_NAME_RESOLVER_CONFIG,
  SkinNameResolverConfig,
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

export interface RewindBootstrapSettings {
  // Usually %APPDATA%
  appDataPath: string;
  // Usually %APPDATA%/rewind
  userDataPath: string;
  // Usually where `${rewind_installation_path}/resources`
  appResourcesPath: string;
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
async function normalBootstrap({
  osuFolder,
  userDataPath,
  appResourcesPath,
}: {
  osuFolder: string;
  userDataPath: string;
  appResourcesPath: string;
}) {
  Logger.log("Bootstrapping normally");
  // Find out osu! folder through settings
  const rewindCfgPath = getRewindCfgPath(userDataPath);
  const skinNameResolverConfig: SkinNameResolverConfig = [
    { prefix: "osu", path: join(osuFolder, "Skins") },
    { prefix: "rewind", path: join(appResourcesPath, "Skins") },
  ];

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
      { provide: OSU_FOLDER, useValue: osuFolder },
      { provide: REWIND_CFG_PATH, useValue: rewindCfgPath },
      { provide: SKIN_NAME_RESOLVER_CONFIG, useValue: skinNameResolverConfig },
      SkinNameResolver,
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

  // So that "rewind" skins are also accessible
  skinNameResolverConfig.forEach((config) => {
    app.useStaticAssets(config.path, { prefix: `/static/skins/${config.prefix}` });
  });
  app.useStaticAssets(join(osuFolder, "Songs"), { prefix: "/static/songs" });

  await app.listen(port, listenCallback);
}

interface SetupBootstrapSettings {
  userDataPath: string;
}

function getRewindCfgPath(applicationDataPath: string) {
  return join(applicationDataPath, REWIND_CFG_NAME);
}

export async function setupBootstrap({ userDataPath }: SetupBootstrapSettings) {
  Logger.log("Setup bootstrap started");

  const rewindCfgPath = getRewindCfgPath(userDataPath);
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

export async function bootstrapRewindDesktopBackend(settings: RewindBootstrapSettings) {
  Logger.log(`Bootstrapping with settings: ${JSON.stringify(settings)}`);
  const { appDataPath, userDataPath, appResourcesPath } = settings;
  const osuFolder = await readOsuFolder(userDataPath);
  const requiresSetup = osuFolder === undefined || !(await osuFolderSanityCheck(osuFolder));
  if (requiresSetup) {
    return setupBootstrap({ userDataPath });
  } else {
    return normalBootstrap({ userDataPath, osuFolder, appResourcesPath });
  }
}
