import { inject, injectable } from "inversify";
import { GameSimulator } from "../../GameSimulator";
import { Container, Text } from "pixi.js";
import { AnalysisHitErrorBar } from "../../../../pixi/components/HitErrorBar";
import { OsuClassicNumber } from "@rewind/osu-pixi/classic-components";
import { hitWindowsForOD } from "@rewind/osu/math";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../stage/GameStagePreparer";
import { StageSkinService } from "../../../StageSkinService";
import { Beatmap } from "@rewind/osu/core";
import { TYPES } from "../../../types";

@injectable()
export class ForegroundHUDPreparer {
  container: Container;
  stats: Text;
  hitErrorBar: AnalysisHitErrorBar;

  constructor(
    @inject(TYPES.BEATMAP) private readonly beatmap: Beatmap,
    private readonly stageSkinService: StageSkinService,
    private readonly gameSimulator: GameSimulator,
  ) {
    this.container = new Container();
    this.stats = new Text("", { fontSize: 16, fill: 0xeeeeee, fontFamily: "Arial", align: "left" });
    this.hitErrorBar = new AnalysisHitErrorBar();
  }

  prepare() {
    const skin = this.stageSkinService.getSkin();
    const gameplayInfo = this.gameSimulator.getCurrentInfo();
    const gameplayState = this.gameSimulator.getCurrentState();
    const time = gameplayState.currentTime;
    const beatmap = this.beatmap;

    this.container.removeChildren();

    if (gameplayInfo) {
      const comboNumber = new OsuClassicNumber();
      const textures = skin.getComboNumberTextures();
      const overlap = skin.config.fonts.comboOverlap;
      comboNumber.prepare({ number: gameplayInfo.currentCombo, textures, overlap });
      comboNumber.position.set(50, STAGE_HEIGHT - 25);
      this.container.addChild(comboNumber);
    }

    // acc

    if (gameplayInfo) {
      // const text
      const accNumber = new OsuClassicNumber();
      const textures = skin.getScoreTextures();
      const overlap = skin.config.fonts.scoreOverlap;
      // TODO: Add % sign and comma
      const number = Math.round(gameplayInfo.accuracy * 10000);
      accNumber.prepare({ number, textures, overlap });
      accNumber.position.set(STAGE_WIDTH - 50, 25);
      this.container.addChild(accNumber);
    }

    // verdict counts: 300, 100, 50, miss

    if (gameplayInfo) {
      const count = gameplayInfo.verdictCounts;
      const maxCombo = gameplayInfo.maxComboSoFar;
      this.stats.text = `300: ${count[0]}\n100: ${count[1]}\n50: ${count[2]}\nMisses: ${count[3]}\n\nMaxCombo: ${maxCombo}`;
      this.stats.position.set(25, 50);
      this.container.addChild(this.stats);
    }

    // hit error
    {
      // TODO: optimize
      const hits = [];
      if (gameplayState) {
        for (const id in gameplayState.hitCircleVerdict) {
          const s = gameplayState.hitCircleVerdict[id];
          const hitCircle = beatmap.getHitCircle(id);
          const offset = s.judgementTime - hitCircle.hitTime;
          const timeAgo = time - s.judgementTime;
          if (timeAgo >= 0 && timeAgo < 3000) hits.push({ offset, timeAgo, miss: s.type === "MISS" });
        }
      }

      const [hitWindow300, hitWindow100, hitWindow50] = hitWindowsForOD(beatmap.difficulty.overallDifficulty);
      this.hitErrorBar.prepare({
        hitWindow50,
        hitWindow100,
        hitWindow300,
        hits,
        // hits: [
        //   { timeAgo: 100, offset: -2 },
        //   { timeAgo: 2, offset: +10 },
        // ],
      });
      this.hitErrorBar.container.position.set(STAGE_WIDTH / 2, STAGE_HEIGHT - 20);
      this.hitErrorBar.container.scale.set(2.0);
      this.container.addChild(this.hitErrorBar.container);
    }
  }
}
