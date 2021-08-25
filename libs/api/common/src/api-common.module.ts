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
import { UserConfigService } from "./config/UserConfigService";
import { OsuDBDao } from "./blueprints/OsuDBDao";

// const osuFolderFactory = {
//   provide: OSU_FOLDER,
//   useFactory: (userConfigService: UserConfigService) => {
//     return userConfigService.getConfig().osuDirectory;
//   },
//   inject: [UserConfigService],
// }; // TODO: Dynamically resolve...

const osuFolderFactory = {
  provide: OSU_FOLDER,
  useValue: "E:\\osu!",
};

//
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [LocalReplayController, SkinController, LocalBlueprintController],
  providers: [
    osuFolderFactory,
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
export class ApiCommonModule {}
