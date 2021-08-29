import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { API_BASE_URL } from "./constants";

interface RewindDesktopConfig {
  osuStablePath: string;
}

interface BackendState {
  state: string;
}

export const rewindDesktopApi = createApi({
  reducerPath: "rewindDesktopApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    status: builder.query<BackendState, void>({
      query: () => `status`,
    }),
    updateOsuDirectory: builder.mutation<RewindDesktopConfig, RewindDesktopConfig>({
      query: ({ osuStablePath }) => ({
        url: `desktop`,
        method: "POST",
        body: { osuStablePath },
      }),
    }),
  }),
});

export const { useUpdateOsuDirectoryMutation } = rewindDesktopApi;
