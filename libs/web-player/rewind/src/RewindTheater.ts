import { Container } from "inversify";
import { BlueprintService } from "./core/api/BlueprintService";
import { ReplayService } from "./core/api/ReplayService";
import { SkinLoader } from "./core/api/SkinLoader";
import { AudioService } from "./core/audio/AudioService";
import { TextureManager } from "./textures/TextureManager";
import { TYPES } from "./types/types";
import { createRewindAnalysisApp } from "./creators/createRewindAnalysisApp";
import { SkinId } from "./model/SkinId";
import { SkinManager } from "./core/skins/SkinManager";

/**
 * Creates the Rewind app that serves multiple tools.
 *
 * Common settings such as preferred skin are set here.
 */

export class RewindTheater {
  private readonly container: Container;

  constructor(private apiUrl: string) {
    this.container = new Container();
    this.container.bind(TYPES.API_URL).toConstantValue(apiUrl);
    this.container.bind(BlueprintService).toSelf().inSingletonScope();
    this.container.bind(ReplayService).toSelf().inSingletonScope();
    this.container.bind(SkinLoader).toSelf().inSingletonScope();
    this.container.bind(SkinManager).toSelf().inSingletonScope();
    this.container.bind(AudioService).toSelf().inSingletonScope();
  }

  createAnalysisApp() {
    return createRewindAnalysisApp(this.container);
  }

  // @PostConstruct
  initialize() {
    // TODO: Load default skin
    // TODO: Load preferred skin
    // Load other textures
  }

  async loadPreferredSkin() {
    // From
  }

  async changeSkin(skinId: SkinId) {
    const skinLoader = this.container.get(SkinLoader);
    const skin = await skinLoader.loadSkin(skinId);

    const skinManager = this.container.get(SkinManager);
    skinManager.setSkin(skin);
  }
}

interface Settings {
  apiUrl: string;
}

export function createRewindTheater({ apiUrl }: Settings) {
  return new RewindTheater(apiUrl);
}
