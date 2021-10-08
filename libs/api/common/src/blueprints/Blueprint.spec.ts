import { readFile } from "fs/promises";
import { createHash } from "crypto";

test("md5hash", async () => {
  // PS E:\osu!\Songs\351280 HoneyWorks - Akatsuki Zukuyo> CertUtil -hashfile '.\HoneyWorks - Akatsuki Zukuyo ([C u r
  // i]) [Taeyang''s Extra].osu' MD5 MD5 hash of .\HoneyWorks - Akatsuki Zukuyo ([C u r i]) [Taeyang's Extra].osu:
  // 535c6e5b4febb48629cbdd4e3a268624 CertUtil: -hashfile command completed successfully.
  const expectedHash = "535c6e5b4febb48629cbdd4e3a268624";

  const file =
    "E:\\osu!\\Songs\\351280 HoneyWorks - Akatsuki Zukuyo\\HoneyWorks - Akatsuki Zukuyo ([C u r i]) [Taeyang's Extra].osu";
  const data = await readFile(file);
  const hash = createHash("md5");
  hash.update(data);
  const actualHash = hash.digest("hex");
  expect(actualHash).toEqual(expectedHash);
});
