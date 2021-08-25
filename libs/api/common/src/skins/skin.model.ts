import { Field, Int, ObjectType, ID } from "@nestjs/graphql";

@ObjectType()
class SkinTextureLocation {
  id: string;
  @Field(() => [String], {
    description: "Skin texture locations since a skin texture like `hit100` can have multiple files",
  })
  paths: string[];
}

@ObjectType()
export class Skin {
  @Field({ description: "The identifier is also the folder name" })
  id: string;

  @Field(() => [SkinTextureLocation])
  files: SkinTextureLocation[];
}
