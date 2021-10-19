import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { PlaybarSettings } from "../settings/PlaybarSettings";
import { injectable } from "inversify";

@injectable()
export class PlaybarSettingsStore extends AbstractSettingsStore<PlaybarSettings> {}
