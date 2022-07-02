import { useCommonManagers } from "../providers/TheaterProvider";


export function useAppInfo() {
  const { appInfoService } = useCommonManagers();

  return {
    appVersion: appInfoService.version,
    platform: appInfoService.platform,
  };
}
