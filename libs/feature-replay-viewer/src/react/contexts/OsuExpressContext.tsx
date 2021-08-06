/**
 * This whole application is designed to work with an osu-express app in the background.
 */
import React, { createContext, useContext } from "react";
import { OsuExpressSkinManager, SkinManager } from "../../skins/SkinManager";
import { OsuExpressReplayManager, ReplayManager } from "../../managers/ReplayManager";
import { BlueprintManager, OsuExpressBlueprintManager } from "../../managers/BlueprintManager";

export type OsuExpressManagers = {
  skinManager: SkinManager;
  replayManager: ReplayManager;
  blueprintManager: BlueprintManager;
};

const OsuExpressContext = createContext<OsuExpressManagers | undefined>(undefined);

export type OsuExpressProps = {
  url: string;
  children?: React.ReactNode;
};

export const OsuExpressProvider = (props: OsuExpressProps) => {
  const { url } = props;

  const skinManager = new OsuExpressSkinManager(url);
  const replayManager = new OsuExpressReplayManager(url);
  const blueprintManager = new OsuExpressBlueprintManager(url + "/static/songs"); // todo: fix

  const managers = {
    skinManager,
    replayManager,
    blueprintManager,
  };

  return <OsuExpressContext.Provider value={managers}>{props.children}</OsuExpressContext.Provider>;
};

export const useOsuExpressManagers = () => {
  return useContext(OsuExpressContext);
};
