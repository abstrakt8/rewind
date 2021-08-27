import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const apiUrl = "http://localhost:7271/api";

interface RewindDesktopConfig {
  osuStablePath: string;
}

export const rewindDesktopApi = createApi({
  reducerPath: "rewindDesktopApi",
  baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
  endpoints: (builder) => ({
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
