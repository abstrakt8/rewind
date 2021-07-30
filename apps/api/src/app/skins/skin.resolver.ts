import { Args, Query, Resolver } from "@nestjs/graphql";
import { Skin } from "./skin.model";
import { SkinService } from "./skin.service";

@Resolver((of) => Skin)
export class SkinResolver {
  constructor(private readonly skinService: SkinService) {}

  @Query((returns) => Skin)
  async config(@Args("id", {}) id: string) {}

  @Query((returns) => [Skin])
  async allSkins() {
    return this.skinService.allSkinsInFolder();
  }
}
