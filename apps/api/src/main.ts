/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);
  app.useStaticAssets("E:\\osu!\\Skins", { prefix: "/static/skins" });
  app.useStaticAssets("E:\\osu!\\Replays", { prefix: "/static/replays" });
  app.useStaticAssets("E:\\osu!\\Data\\r", { prefix: "/static/replays" });
  const port = process.env.PORT || 7271;
  await app.listen(port, () => {
    Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
  });
}

bootstrap();
