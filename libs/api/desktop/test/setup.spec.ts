import * as request from "supertest";
import { setupBootstrap } from "@rewind/api/desktop";
import { INestApplication } from "@nestjs/common";

// https://docs.nestjs.com/fundamentals/testing

describe("Setup E2E", () => {
  const applicationDataPath = "C:\\Users\\me\\AppData\\Roaming\\rewind";
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupBootstrap({ applicationDataPath });
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
