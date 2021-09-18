import "reflect-metadata";
import { ReplayService } from "../src/api/ReplayService";

const url = "http://localhost:7271";
test("ReplayService", async () => {
  const replayService = new ReplayService(url);
  const replay = await replayService.retrieveReplay(
    "exported:abstrakt - AliA - utopia [Feelings] (2021-09-11) Osu.osr",
  );
  console.log(replay);
});
