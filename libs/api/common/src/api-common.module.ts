import { Module } from "@nestjs/common";
import { OSU_FOLDER } from "./constants";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LocalReplayController } from "./replays/LocalReplayController";
import { SkinController } from "./skins/SkinController";
import { LocalBlueprintController } from "./blueprints/LocalBlueprintController";
import { SkinResolver } from "./skins/skin.resolver";
import { SkinService } from "./skins/SkinService";
import { EventsGateway } from "./events/EventsGateway";
import { ReplayWatcher } from "./replays/ReplayWatcher";
import { LocalReplayService } from "./replays/LocalReplayService";
import { LocalBlueprintService } from "./blueprints/LocalBlueprintService";
import { OsuDBDao } from "./blueprints/OsuDBDao";

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [LocalReplayController, SkinController, LocalBlueprintController],
  providers: [
    SkinResolver,
    SkinService,
    EventsGateway,
    ReplayWatcher,
    LocalReplayService,
    LocalBlueprintService,
    OsuDBDao,
  ],
})
export class ApiCommonModule {}
