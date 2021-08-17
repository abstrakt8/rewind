import { injectable } from "inversify";
import { HitCircle } from "@rewind/osu/core";

@injectable()
export class HitCirclePreparer {
  constructor() {}

  prepare(hitCircle: HitCircle) {}
}
