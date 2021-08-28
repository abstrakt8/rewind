import * as request from "supertest";
import { setupBootstrap } from "@rewind/api/desktop";
import { INestApplication } from "@nestjs/common";
import { DesktopConfigService } from "../src/config/DesktopConfigService";
import { join } from "path";

const applicationDataPath = "C:\\Users\\me\\AppData\\Roaming\\rewind";
const rewindCfgPath = join(applicationDataPath, "rewind-test.cfg");

// https://docs.nestjs.com/fundamentals/testing
describe("DesktopConfigService", () => {
  const desktopConfigService = new DesktopConfigService(rewindCfgPath);
  it("save", async () => await desktopConfigService.saveOsuStablePath("E:\\osu!"));
});

describe("Setup E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupBootstrap({ userDataPath: applicationDataPath });
  });

  it("/GET desktop", () => {
    return request(app.getHttpServer())
      .get("/api/desktop")
      .expect(200)
      .then((res) => {
        if (res.ok) {
          console.log("GET /api/desktop\n" + JSON.stringify(res.body));
        }
      });
    // .end((err, res) => {
    // });
  });

  afterAll(async () => {
    await app.close();
  });
});
