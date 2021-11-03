import { ModuleRef, NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import {
  EventsGateway,
  LocalBlueprintController,
  LocalBlueprintService,
  LocalReplayController,
  LocalReplayService,
  OSU_FOLDER,
  OSU_SONGS_FOLDER,
  OsuDBDao,
  ReplayWatcher,
  SKIN_NAME_RESOLVER_CONFIG,
  SkinController,
  SkinNameResolver,
  SkinNameResolverConfig,
  SkinService,
} from "@rewind/api/common";
import { join } from "path";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { determineSongsFolder, osuFolderSanityCheck } from "./config/utils";
import { DesktopConfigService, REWIND_CFG_PATH } from "./config/DesktopConfigService";
import { DesktopConfigController } from "./config/DesktopConfigController";
import { NormalStatusController, SetupStatusController } from "./status/SetupStatusController";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { format } from "winston";
import username = require("username");

const globalPrefix = "/api";
const REWIND_CFG_NAME = "rewind.cfg";

export interface RewindBootstrapSettings {
  // Usually %APPDATA%
  appDataPath: string;
  // Usually %APPDATA%/rewind
  userDataPath: string;
  // Usually where `${rewind_installation_path}/resources`
  appResourcesPath: string;

  // Where to store the logs
  logDirectory: string;
}

interface NormalBootstrapSettings {
  osuFolder: string;
}

const port = process.env.PORT || 7271;

function listenCallback() {
  Logger.log(`Listening at http://localhost:${port}${globalPrefix}`);
}

function createLogger(logDirectory: string) {
  const fileFormat = format.combine(
    format.timestamp(),
    format.align(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  );
  return WinstonModule.createLogger({
    level: "info",
    format: fileFormat,
    transports: [
      new winston.transports.File({ filename: join(logDirectory, "error.log"), level: "error" }),
      new winston.transports.File({ filename: join(logDirectory, "combined.log") }),
      new winston.transports.Console({
        format: format.combine(format.colorize(), fileFormat),
      }),
    ],
  });
}

/**
 * The usual bootstrap happens with the concrete knowledge of the osu! folder. Only at the first start up of the
 * application we will have to refer to boot differently.
 */
async function normalBootstrap(settings: {
  osuFolder: string;
  songsFolder: string;
  userDataPath: string;
  appResourcesPath: string;
  logDirectory: string;
}) {
  const { osuFolder, userDataPath, appResourcesPath, logDirectory, songsFolder } = settings;
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
      { provide: OSU_SONGS_FOLDER, useValue: songsFolder },
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

      const replaysFolder = join(osuFolder, "Replays");
      replayWatcher.watchForReplays(replaysFolder);

      localBlueprintService
        .getAllBlueprints()
        .then((blueprints) => Logger.log(`Loaded all ${Object.keys(blueprints).length} blueprints.`));
      // TODO: Emit and then set the status to booted
      Logger.log(`RewindDesktopModule onModuleInit finished with settings: ${JSON.stringify(settings)}`);
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(RewindDesktopModule, {
    logger: createLogger(logDirectory),
  });

  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  // So that "rewind" skins are also accessible
  skinNameResolverConfig.forEach((config) => {
    app.useStaticAssets(config.path, { prefix: `/static/skins/${config.prefix}` });
  });
  app.useStaticAssets(songsFolder, { prefix: "/static/songs" });
  // app.useLogger();

  await app.listen(port, listenCallback);
}

interface SetupBootstrapSettings {
  userDataPath: string;
  logDirectory: string;
}

function getRewindCfgPath(applicationDataPath: string) {
  return join(applicationDataPath, REWIND_CFG_NAME);
}

export async function setupBootstrap({ userDataPath, logDirectory }: SetupBootstrapSettings) {
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

  const app = await NestFactory.create<NestExpressApplication>(SetupModule, { logger: createLogger(logDirectory) });
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
  console.log(`Bootstrapping with settings: ${JSON.stringify(settings)}`);
  const { appDataPath, userDataPath, appResourcesPath, logDirectory } = settings;
  const osuFolder = await readOsuFolder(userDataPath);

  if (osuFolder === undefined || !(await osuFolderSanityCheck(osuFolder))) {
    return setupBootstrap({ userDataPath, logDirectory });
  } else {
    // This is the fallback songs folder in case username can't be determined or config file is corrupt
    let songsFolder = join(osuFolder, "Songs");
    const userId = await username();
    if (userId !== undefined) {
      const configuredSongsFolder = await determineSongsFolder(osuFolder, userId);
      if (configuredSongsFolder !== undefined) {
        songsFolder = configuredSongsFolder;
      }
    }
    return normalBootstrap({ userDataPath, osuFolder, songsFolder, appResourcesPath, logDirectory });
  }
}
