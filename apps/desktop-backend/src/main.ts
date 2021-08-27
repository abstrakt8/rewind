/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { bootstrapRewindDesktopBackend, setupBootstrap } from "@rewind/api/desktop";

const applicationDataPath = "C:\\Users\\me\\";
bootstrapRewindDesktopBackend({ applicationDataPath });

// setupBootstrap({ applicationDataPath });
