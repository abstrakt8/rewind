import { buildBeatmap, HitCircle, Slider, SliderCheckPointType } from "@rewind/osu/core";
import { osuMapPath, parseBlueprintFromFS, TEST_MAPS } from "./util.spec";

describe("BeatmapBuilder", function () {
  describe("Simple short slider", function () {
    describe("should build when no mods", function () {
      const bluePrint = parseBlueprintFromFS(TEST_MAPS.ONE_SLIDER);
      const hitObjects = buildBeatmap(bluePrint, { addStacking: false, mods: [] }).hitObjects;
      it("should have one slider ", function () {
        expect(hitObjects.length).toBe(1);
        const slider = hitObjects[0] as Slider;
        console.log(slider.path.controlPoints.map((p) => p.offset));

        console.log(slider.ballPositionAt(0));
        console.log(slider.ballPositionAt(0.5));
        console.log(slider.ballPositionAt(1.0));
        /*
        Vec2 { x: 287, y: 147 }
        Vec2 { x: 242.49834839505502, y: 141.5880078631909 }
        Vec2 { x: 198.4392805888815, y: 149.81550051795287 }
         */

        // Only legacy last tick
        expect(slider.checkPoints.length).toBe(1);

        // End time = 1918
        expect(slider.endTime).toBeCloseTo(1918.375, 2);
        // This was tested against osu!lazer version
        expect(slider.checkPoints[0].hitTime).toBeCloseTo(1882.375, 2);
      });
    });
  });
  describe("Simple slider with repeat", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.SLIDER_WITH_ONE_REPEAT);
    const beatmap = buildBeatmap(bluePrint, { addStacking: false });

    const hitObject = beatmap.hitObjects[0];

    it("should build correctly", function () {
      expect(hitObject).toBeInstanceOf(Slider);
      const slider = hitObject as Slider;
      expect(slider.repeatCount).toBe(1);
      expect(slider.checkPoints.length).toBe(2);
      expect(slider.checkPoints[0].type).toBe(SliderCheckPointType.REPEAT);
      expect(slider.checkPoints[1].type).toBe(SliderCheckPointType.LAST_LEGACY_TICK);
    });
  });
  describe("Short kick slider", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.SHORT_KICK_SLIDER);
    const beatmap = buildBeatmap(bluePrint, { addStacking: false });

    const kickSlider = beatmap.hitObjects[0] as Slider;
    console.log(`KickSlider time interval : [${kickSlider.startTime},${kickSlider.endTime}]`);
    // KickSlider time interval : [1684,1715.25]

    it("should build correctly", function () {
      expect(kickSlider.repeatCount).toBe(0);
      expect(kickSlider.checkPoints.length).toBe(1);
      expect(kickSlider.checkPoints[0].type).toBe(SliderCheckPointType.LAST_LEGACY_TICK);

      // The span time interval is shorter than 34ms. Here the legacy last tick is in the center of the time interval.
      expect(kickSlider.checkPoints[0].hitTime).toBeCloseTo(1699.625, 2);
    });
  });

  describe("Violet Perfume / Map with only HitCircles", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.VIOLET_PERFUME);
    const beatmap = buildBeatmap(bluePrint);
    // This map only consists of hit circles
    const hitCircles = beatmap.hitObjects as HitCircle[];
    it("should build correctly", function () {
      expect(beatmap).toBeDefined();
    });
    it("should assign combo indexes correctly", function () {
      expect(hitCircles[0].comboSetIndex).toBe(0);
      expect(hitCircles[0].withinComboSetIndex).toBe(0);

      expect(hitCircles[1].comboSetIndex).toBe(0);
      expect(hitCircles[1].withinComboSetIndex).toBe(1);

      expect(hitCircles[4].comboSetIndex).toBe(1);
      expect(hitCircles[4].withinComboSetIndex).toBe(0);

      for (const h of hitCircles) {
        console.log(`${h.comboSetIndex}/${h.withinComboSetIndex}`);
      }
    });
    it("should apply stacking correctly", function () {
      // They are stacked at position (312, 250) -> see Blueprint of this map
      expect(hitCircles[7].position).not.toEqual(hitCircles[8].position);
      expect(hitCircles[8].position).not.toEqual(hitCircles[9].position);
    });
  });

  describe("Gera Gera / Tech map", function () {
    const bluePrint = parseBlueprintFromFS(TEST_MAPS.GERA_GERA);
    const beatmap = buildBeatmap(bluePrint, { addStacking: false });
    it("should build correctly", function () {
      expect(beatmap).toBeDefined();
      console.log(beatmap);
    });
    it("should assign combo index correctly", function () {
      for (const h of beatmap.hitObjects) {
        if (h instanceof Slider) {
          expect(h.head.comboSetIndex).not.toBeNaN();

          console.log(`${h.head.comboSetIndex}/${h.head.withinComboSetIndex}`);
        }
      }
    });
  });
});
