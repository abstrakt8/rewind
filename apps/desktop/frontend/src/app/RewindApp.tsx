import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { Routes } from "react-router";
import { Navigate, Outlet, Route, useNavigate } from "react-router-dom";
import { LeftMenuSidebar } from "./components/sidebar/LeftMenuSidebar";
import { SplashScreen } from "./screens/splash/SplashScreen";
import { SetupScreen } from "./screens/setup/SetupScreen";
import { HomeScreen } from "./screens/home/HomeScreen";
import { Box, Divider, Stack } from "@mui/material";
import { UpdateModal } from "./components/update/UpdateModal";
import { useEffect } from "react";
import { downloadFinished, downloadProgressed, newVersionAvailable } from "./store/update/slice";
import { frontendAPI } from "./api";
import { BackendState, stateChanged } from "./store/backend/slice";
import { ipcRenderer } from "electron";
import { useTheaterContext } from "./providers/TheaterProvider";
import { ELECTRON_UPDATE_FLAG } from "./utils/constants";
import { Analyzer } from "./screens/analyzer/Analyzer";

function ConnectedSplashScreen() {
  const status: BackendState = useAppSelector((state) => state.backend.status);
  if (status === "READY") {
    return <Navigate to={"/app/analyzer"} replace />;
  }
  if (status === "SETUP_MISSING") {
    return <Navigate to={"/setup"} />;
  }
  return <SplashScreen status={status} />;
}

function ConnectedSetupScreen() {
  return <SetupScreen />;
}

function NormalView() {
  const { status } = useAppSelector((state) => state.backend);

  if (status !== "READY") {
    return <div>You should not be here</div>;
  }
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

// TODO: Create an app that also runs on 4200 and is used only for testing specific pages such as analyzer
const DEBUG = true;

export function RewindApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theater = useTheaterContext();

  useEffect(() => {
    // yield call(waitForBackendState, "READY");
    // yield call(analyzer.startWatching.bind(analyzer));
    void theater.common.initialize();

    ipcRenderer.on("onManualReplayOpen", (event, file) => {
      navigate("/app/analyzer");
      void theater.analyzer.loadReplay(file);
    });

    if (DEBUG) {
      navigate("/app/analyzer");
      void theater.analyzer.loadReplay(
        "/run/media/me/Games/osu!/Replays/abstrakt - Bliitzit - Team Magma & Aqua Leader Battle Theme (Unofficial) [SMOKELIND's Insane] (2022-03-15) Osu.osr",
      );
    }

    if (!theater.analyzer.osuFolderService.getOsuFolder()) {
      console.log("osu! folder was not set...");
      dispatch(stateChanged("SETUP_MISSING"));
    } else {
      console.log(`osu! folder = ${theater.analyzer.osuFolderService.getOsuFolder()}`);
      console.log(`osu!/Songs folder = ${theater.analyzer.osuFolderService.songsFolder$.getValue()}`);
      console.log(`osu!/Replays folder = ${theater.analyzer.osuFolderService.replaysFolder$.getValue()}`);
      dispatch(stateChanged("READY"));
    }

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
      <Route index element={<ConnectedSplashScreen />} />
      <Route path={"setup"} element={<ConnectedSetupScreen />} />
      <Route path={"app"} element={<NormalView />}>
        <Route path={"home"} element={<HomeScreen />} />
        <Route path={"analyzer"} element={<Analyzer />} />
      </Route>
    </Routes>
  );
}
