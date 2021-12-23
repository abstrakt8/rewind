import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { Routes } from "react-router";
import { Navigate, Outlet, Route, useNavigate } from "react-router-dom";
import { LeftMenuSidebar } from "./LeftMenuSidebar";
import { SplashScreen } from "./splash/SplashScreen";
import { SetupScreen } from "./setup/SetupScreen";
import { HomeScreen } from "./home/HomeScreen";
import { Box, Divider, Stack } from "@mui/material";
import { Analyzer, useTheaterContext } from "@rewind/feature-replay-viewer";
import { UpdateModal } from "./UpdateModal";
import { useEffect } from "react";
import { downloadFinished, downloadProgressed, newVersionAvailable } from "./update/slice";
import { frontendAPI } from "./api";
import { BackendState } from "./backend/slice";

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

export function RewindApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theater = useTheaterContext();

  useEffect(() => {
    frontendAPI.onManualReplayOpen((file) => {
      navigate("/app/analyzer");
      void theater.analyzer.loadReplay(`local:${file}`);
    });
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
  }, [dispatch, navigate, theater.analyzer]);

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
