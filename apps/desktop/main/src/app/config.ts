import Ajv, { JSONSchemaType } from "ajv";
import { join } from "path";
import { readFileSync } from "fs";

const ajv = new Ajv({ useDefaults: true });
const REWIND_CFG_NAME = "rewind.cfg";

export interface RewindElectronSettings {
  osuPath: string;
}

const DEFAULT_REWIND_ELECTRON_SETTINGS: RewindElectronSettings = Object.freeze({ osuPath: "" });

export const RewindElectronSettingsSchema: JSONSchemaType<RewindElectronSettings> = {
  type: "object",
  properties: {
    osuPath: { type: "string", default: DEFAULT_REWIND_ELECTRON_SETTINGS.osuPath },
  },
  required: [],
};

const validate = ajv.compile<RewindElectronSettings>(RewindElectronSettingsSchema);

export function readRewindElectronSettings(configPath: string) {
  const file = join(configPath, REWIND_CFG_NAME);
  let json;
  try {
    const str = readFileSync(file, "utf-8");
    json = JSON.parse(str);
  } catch (e) {
    console.warn("Could not parse the config correctly:\n" + e);
    return DEFAULT_REWIND_ELECTRON_SETTINGS;
  }
  if (!validate(json)) {
    console.warn(
      "Could not validate the config JSON correctly. Do not modify the file if you are not sure what you are doing.",
    );
    return DEFAULT_REWIND_ELECTRON_SETTINGS;
  }
  return json;
}
