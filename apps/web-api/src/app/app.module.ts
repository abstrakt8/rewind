import { Module } from "@nestjs/common";
import { ApiCommonModule } from "@rewind/api/common";

@Module({
  imports: [ApiCommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
