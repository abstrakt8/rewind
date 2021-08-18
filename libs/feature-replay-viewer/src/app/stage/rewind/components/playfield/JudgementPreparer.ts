import { inject, injectable } from "inversify";
import { Container } from "pixi.js";
import { Scene } from "../../../../../game/Scene";
import { OsuClassicJudgement } from "@rewind/osu-pixi/classic-components";
import { circleSizeToScale } from "@rewind/osu/math";
import { Beatmap, MainHitObjectVerdict } from "@rewind/osu/core";
import { SkinTextures } from "@rewind/osu/skin";
import { GameplayClock } from "../../../core/GameplayClock";
import { StageSkinService } from "../../../StageSkinService";
import { TYPES } from "../../../types";
import { OsuReplay } from "../../../../theater";
import { GameSimulator } from "../../GameSimulator";

function texturesForJudgement(t: MainHitObjectVerdict, lastInComboSet?: boolean) {
  switch (t) {
    case "GREAT":
      return lastInComboSet ? SkinTextures.HIT_300K : SkinTextures.HIT_300;
    case "OK":
      return lastInComboSet ? SkinTextures.HIT_100K : SkinTextures.HIT_100;
    case "MEH":
      return SkinTextures.HIT_50;
    case "MISS":
      return SkinTextures.HIT_0;
  }
}

@injectable()
export class JudgementPreparer {
  private readonly container: Container;

  constructor(
    private readonly gameClock: GameplayClock,
    private readonly stageSkinService: StageSkinService,
    @inject(TYPES.BEATMAP) private readonly beatmap: Beatmap,
    private readonly gameSimulator: GameSimulator,
  ) {
    this.container = new Container();
  }

  getContainer() {
    return this.container;
  }

  prepare() {
    this.container.removeChildren();
    const beatmap = this.beatmap;
    const time = this.gameClock.timeElapsedInMs;
    const skin = this.stageSkinService.getSkin();
    const judgements = this.gameSimulator.judgements;
    // TODO: Order might not be correct
    for (const j of judgements) {
      const timeAgo = time - j.time;
      if (!(timeAgo >= 0 && timeAgo < 3000) || j.verdict === "GREAT") continue;

      const lastInComboSet = false;
      const textures = skin.getTextures(texturesForJudgement(j.verdict, lastInComboSet));
      const animationFrameRate = skin.config.general.animationFrameRate;
      const judgement = new OsuClassicJudgement();
      const scale = circleSizeToScale(beatmap.difficulty.circleSize);

      // TODO: Should be configurable, technically speaking sliderHeadJudgementSkip=false does not reflect osu!stable
      // (it resembles lazer) However, in this replay analysis tool this is more useful (?)
      const sliderHeadJudgementSkip = true;
      if (sliderHeadJudgementSkip && j.isSliderHead) continue;
      judgement.prepare({ time: timeAgo, position: j.position, scale, animationFrameRate, textures });
      // judgement.sprite.zIndex = -timeAgo;
      this.container.addChild(judgement.sprite);
    }
    // this.judgementLayer.sortChildren();
  }
}
