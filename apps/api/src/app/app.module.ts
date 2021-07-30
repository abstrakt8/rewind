import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { SkinResolver } from "./skins/skin.resolver";
import { SkinService } from "./skins/skin.service";

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SkinResolver, SkinService],
})
export class AppModule {}
