import { RawReplayData } from "@rewind/osu/core";

function createApi(url: string) {
  const baseUrl = url + "/api";

  async function getRawBlueprintByMd5(md5: string) {
    const result = await fetch(`${baseUrl}/blueprints/${md5}/osu`);
    return result.text();
  }

  // replayId = exported/${name}
  // Or just internal/${md5}
  async function getReplayById(replayId: string): Promise<RawReplayData> {
    const result = await fetch(`${baseUrl}/replays/exported/${replayId}`);
    return result.json();
  }

  return { getRawBlueprintByMd5, getReplayById };
}

export const RewindAPI = createApi("http://localhost:7271");
