import { environment } from "./environments/environment";
import { bootstrapRewindDesktopBackend, RewindBootstrapSettings } from "./DesktopAPI";

const settings: RewindBootstrapSettings = {
  userDataPath: environment.userDataPath,
  appDataPath: environment.appDataPath,
  appResourcesPath: environment.appResourcesPath,
  logDirectory: environment.logDirectory,
};

void bootstrapRewindDesktopBackend(settings);
