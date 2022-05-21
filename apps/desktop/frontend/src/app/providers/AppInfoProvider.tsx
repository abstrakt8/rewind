// This will expose the Electron environment variables / functionalities as a context

import { createContext, ReactNode, useContext } from "react";

interface IAppInfo {
  appVersion: string;
  platform: string;
}

interface AppInfoProps {
  children: ReactNode;
  appInfo: IAppInfo;
}

const AppInfo = createContext<IAppInfo>(null!);

export function AppInfoProvider({ children, appInfo }: AppInfoProps) {
  return <AppInfo.Provider value={appInfo}>{children}</AppInfo.Provider>;
}

export function useAppInfo() {
  const context = useContext(AppInfo);
  if (!context) {
    throw Error("useAppInfo can only be used within a AppInfoProvider");
  }
  return context;
}
