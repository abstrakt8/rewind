/**
 * This whole application is designed to work with an osu-express app in the background.
 */
import React, { createContext, useContext } from "react";
import { RootStore } from "../stores/RootStore";

const MobXContext = createContext<RootStore>(new RootStore());

export type OsuExpressProps = {
  children?: React.ReactNode;
};

export const MobXProvider = (props: OsuExpressProps) => {
  const { children } = props;
  // Maybe plugin some API clients idk
  return <MobXContext.Provider value={new RootStore()}>{props.children}</MobXContext.Provider>;
};

export const useMobXContext = () => {
  return useContext(MobXContext);
};
