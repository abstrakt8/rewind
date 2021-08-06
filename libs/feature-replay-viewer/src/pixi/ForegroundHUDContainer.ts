import { Scene } from "../game/Scene";
import { OsuClassicNumber } from "@rewind/osu-pixi/classic-components";
import { hitWindowsForOD } from "@rewind/osu/math";
import { Container, Text } from "pixi.js";
import { AnalysisHitErrorBar } from "./components/HitErrorBar";

export class ForegroundHUDContainer {
  widthInPx = 0;
  heightInPx = 0;
  container: Container;
  stats: Text;
  hitErrorBar: AnalysisHitErrorBar;

  constructor() {
    this.container = new Container();
    this.stats = new Text("", { fontSize: 12, fill: "white" });
    this.hitErrorBar = new AnalysisHitErrorBar();
  }

  // Temporary solution
  resizeTo(widthInPx: number, heightInPx: number) {
    this.widthInPx = widthInPx;
    this.heightInPx = heightInPx;
  }

  prepare(scene: Scene) {
    const { widthInPx, heightInPx } = this;
    const { skin, gameplayInfo, time, gameplayState, beatmap } = scene;

    this.container.removeChildren();

    if (gameplayInfo) {
      const comboNumber = new OsuClassicNumber();
      const textures = skin.getComboNumberTextures();
      const overlap = skin.config.fonts.comboOverlap;
      comboNumber.prepare({ number: gameplayInfo.currentCombo, textures, overlap });
      comboNumber.position.set(100, heightInPx - 50);
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
      accNumber.position.set(widthInPx - 100, 50);
      this.container.addChild(accNumber);
    }

    // verdict counts: 300, 100, 50, miss

    if (gameplayInfo) {
      const count = gameplayInfo.verdictCounts;
      const maxCombo = gameplayInfo.maxComboSoFar;
      this.stats.text = `${count[0]}x300, ${count[1]}x100, ${count[2]}x50 ${count[3]}xMisses\nMaxCombo: ${maxCombo}`;
      this.stats.position.set(100, 100);
      this.stats.addChild(this.stats);
    }

    // hit error
    {
      // TODO: optimize
      const hits = [];
      if (gameplayState) {
        for (const [id, s] of gameplayState.hitCircleState.entries()) {
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
      this.hitErrorBar.container.position.set(widthInPx / 2, heightInPx - 30);
      this.hitErrorBar.container.scale.set(2.0);
      this.container.addChild(this.hitErrorBar.container);
    }
  }
}
