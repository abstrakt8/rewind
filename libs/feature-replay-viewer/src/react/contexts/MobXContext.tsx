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
    socket.on(
      "replayAdded",
      (replay: { filename: string }, beatmapMetaData: { folderName: string; osuFileName: string }) => {
        const { folderName, osuFileName } = beatmapMetaData;
        console.log(`Replay added: ${replay.filename}, ${beatmapMetaData.folderName}`);

        const blueprintId = `${folderName}/${osuFileName}`;
        const replayId = replay.filename;
        rootStore.scenarioService.changeScenario(blueprintId, replayId).then(() => {
          console.log("Successfully changed scenario from WebSocket broadcast");
        });
      },
    );
  }

  return <MobXContext.Provider value={rootStore}>{children}</MobXContext.Provider>;
};

export const useMobXContext = () => {
  return useContext(MobXContext);
};
