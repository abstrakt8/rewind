import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { RawReplayData } from "@rewind/osu/core";

const apiUrl = process.env.REWIND_API_URL || "http://localhost:7271";
type RawBlueprint = string;

export const rewindApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: apiUrl + "/api" }),
  endpoints: (builder) => ({
    getRawBlueprintByMd5: builder.query<RawBlueprint, string>({
      query: (md5) => `blueprints/${md5}/osu`,
    }),
    getExportedReplayByName: builder.query<RawReplayData, string>({
      query: (replayName) => `replays/exported/${replayName}`,
    }),
  }),
});
