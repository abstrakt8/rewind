import { useAppDispatch } from "./hooks/redux";
import { Outlet, Routes, Route, useNavigate } from "react-router-dom";
import { LeftMenuSidebar } from "./components/sidebar/LeftMenuSidebar";
import { SplashScreen } from "./screens/splash/SplashScreen";
import { HomeScreen } from "./screens/home/HomeScreen";
import { Box, Divider, Stack } from "@mui/material";
import { UpdateModal } from "./components/update/UpdateModal";
import { useEffect } from "react";
import { downloadFinished, downloadProgressed, newVersionAvailable } from "./store/update/slice";
import { frontendAPI } from "./api";
import { ipcRenderer } from "electron";
import { useTheaterContext } from "./providers/TheaterProvider";
import { ELECTRON_UPDATE_FLAG } from "./utils/constants";
import { Analyzer } from "./screens/analyzer/Analyzer";
import { SetupScreen } from "./screens/setup/SetupScreen";

function NormalView() {
  return (
    <Stack direction={"row"} sx={{ height: "100vh" }}>
      <LeftMenuSidebar />
      <Divider orientation={"vertical"} />
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        <Outlet />
      </Box>
      <UpdateModal />
    </Stack>
  );
}

export function RewindApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theater = useTheaterContext();

  useEffect(() => {
    void theater.common.initialize();

    // For now, we will just navigate to the analyzer app since we only have one tool
    ipcRenderer.on("onManualReplayOpen", (event, file) => {
      navigate("/app/analyzer");
      void theater.analyzer.loadReplay(file);
    });

    (async function () {
      if (!(await theater.analyzer.osuFolderService.hasValidOsuFolderSet())) {
        console.log("osu! folder was not set, redirecting to the setup screen.");
        navigate("/setup");
      } else {
        console.log(`osu! folder = ${theater.analyzer.osuFolderService.getOsuFolder()}`);
        console.log(`osu!/Songs folder = ${theater.analyzer.osuFolderService.songsFolder$.getValue()}`);
        console.log(`osu!/Replays folder = ${theater.analyzer.osuFolderService.replaysFolder$.getValue()}`);
        navigate("/app/analyzer");
      }
    })();

    if (ELECTRON_UPDATE_FLAG) {
      frontendAPI.onUpdateAvailable((version) => {
        dispatch(newVersionAvailable(version));
      });
      frontendAPI.onDownloadFinished(() => {
        dispatch(downloadFinished());
      });
      frontendAPI.onUpdateDownloadProgress((updateInfo) => {
        const { total, bytesPerSecond, transferred } = updateInfo;
        dispatch(downloadProgressed({ downloadedBytes: transferred, totalBytes: total, bytesPerSecond }));
      });
      // We start checking for update on the front end, otherwise if we start it from the Electron main process, the
      // notification might get lost (probably need a message queue if we want to start from the Electron main process)
      frontendAPI.checkForUpdate();
    }
  }, []);

  return (
    <Routes>
      <Route index element={<SplashScreen />} />
      <Route path={"setup"} element={<SetupScreen />} />
      <Route path={"app"} element={<NormalView />}>
        <Route path={"home"} element={<HomeScreen />} />
        <Route path={"analyzer"} element={<Analyzer />} />
      </Route>
    </Routes>
  );
}
