import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { SkinResolver } from "./skins/skin.resolver";
import { SkinService } from "./skins/skin.service";

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SkinResolver, SkinService],
})
export class AppModule {}
