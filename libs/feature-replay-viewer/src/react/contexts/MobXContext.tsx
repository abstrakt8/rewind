/**
 * This whole application is designed to work with an osu-express app in the background.
 */
import React, { createContext, useContext } from "react";
import { RootStore } from "../../stores/RootStore";

const MobXContext = createContext<RootStore>(new RootStore({ url: "" }));

export type MobXProps = {
  url: string;
  children?: React.ReactNode;
};

export const MobXProvider = (props: MobXProps) => {
  const { children, url } = props;
  return <MobXContext.Provider value={new RootStore({ url })}>{children}</MobXContext.Provider>;
};

export const useMobXContext = () => {
  return useContext(MobXContext);
};
