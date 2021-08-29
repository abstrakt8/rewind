import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LocalReplayController } from "./replays/LocalReplayController";
import { SkinController } from "./skins/SkinController";
import { LocalBlueprintController } from "./blueprints/LocalBlueprintController";
import { SkinService } from "./skins/SkinService";
import { EventsGateway } from "./events/EventsGateway";
import { ReplayWatcher } from "./replays/ReplayWatcher";
import { LocalReplayService } from "./replays/LocalReplayService";
import { LocalBlueprintService } from "./blueprints/LocalBlueprintService";
import { OsuDBDao } from "./blueprints/OsuDBDao";

// TODO: Delete, pretty unnecessary
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [LocalReplayController, SkinController, LocalBlueprintController],
  providers: [SkinService, EventsGateway, ReplayWatcher, LocalReplayService, LocalBlueprintService, OsuDBDao],
})
export class ApiCommonModule {}
