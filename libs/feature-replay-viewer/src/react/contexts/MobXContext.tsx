/**
 * This whole application is designed to work with an osu-express app in the background.
 */
import React, { createContext, useContext } from "react";
import { RootStore } from "../../stores/RootStore";
import { Socket } from "socket.io-client";

const MobXContext = createContext<RootStore>(new RootStore({ url: "" }));

export type MobXProps = {
  url: string;
  socket?: Socket;
  children?: React.ReactNode;
};

export const MobXProvider = (props: MobXProps) => {
  const { children, url, socket } = props;
  const rootStore = new RootStore({ url });
  if (socket) {
    socket.on("replayAdded", (replay: { filename: string }, beatmapMetaData: { md5Hash: string }) => {
      const { md5Hash } = beatmapMetaData;
      console.log(`Replay added: ${replay.filename}, ${md5Hash}`);

      const blueprintId = md5Hash;
      const replayId = replay.filename;
      rootStore.scenarioService.changeScenario(blueprintId, replayId).then(() => {
        console.log("Successfully changed scenario from WebSocket broadcast");
      });
    });
  }

  return <MobXContext.Provider value={rootStore}>{children}</MobXContext.Provider>;
};

export const useMobXContext = () => {
  return useContext(MobXContext);
};
