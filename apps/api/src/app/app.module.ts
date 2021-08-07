import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { SkinResolver } from "./skins/skin.resolver";
import { EventsGateway } from "./events/EventsGateway";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ReplayWatcher } from "./replays/ReplayWatcher";
import { UserConfigService } from "./config/UserConfigService";
import { LocalReplayService } from "./replays/LocalReplayService";
import { LocalReplayController } from "./replays/LocalReplayController";
import { SkinController } from "./skins/SkinController";
import { SkinService } from "./skins/SkinService";
import { LocalBlueprintController } from "./blueprints/LocalBlueprintController";
import { LocalBlueprintService } from "./blueprints/LocalBlueprintService";
import { OSU_FOLDER } from "./constants";
import { OsuDBDao } from "./blueprints/OsuDBDao";

// TODO: Split into multiple modules: Replay/Skin/ ...

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController, LocalReplayController, SkinController, LocalBlueprintController],
  providers: [
    { provide: OSU_FOLDER, useValue: "E:\\osu!" }, // TODO: Dynamically resolve...
    AppService,
    SkinResolver,
    SkinService,
    EventsGateway,
    ReplayWatcher,
    LocalReplayService,
    LocalBlueprintService,
    UserConfigService,
    OsuDBDao,
  ],
})
export class AppModule {}
