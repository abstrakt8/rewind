import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { Route, Switch } from "react-router-dom"; // react-router v4/v5
import { LeftMenuSidebar } from "./LeftMenuSidebar";
import { SplashScreen } from "./splash/SplashScreen";
import { SetupScreen } from "./setup/SetupScreen";
import { useEffect } from "react";
import { HomeScreen } from "./home/HomeScreen";
import { Box, Divider, Modal, Stack } from "@mui/material";
import { Analyzer } from "@rewind/feature-replay-viewer";
import { BaseSettingsModal } from "../../../../libs/feature-replay-viewer/src/components/BaseSettingsModal";
import { settingsModalClosed } from "./settings/slice";

function ConnectedAnalyzer() {
  const { chosenBlueprintId, chosenReplayId } = useAppSelector((state) => state.theater);
  useEffect(() => {
    console.log(`Theater is now constructing a stage with blueprintId=${chosenBlueprintId} replayId=${chosenReplayId}`);
  }, [chosenReplayId, chosenBlueprintId]);
  return <Analyzer />;
}

function ConnectedSplashScreen() {
  const status = useAppSelector((state) => state.backend.status);
  return <SplashScreen status={status} />;
}

function ConnectedSetupScreen() {
  return <SetupScreen />;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
};

function NormalView() {
  const { status } = useAppSelector((state) => state.backend);
  const settingsModalOpen = useAppSelector((state) => state.settings.open);
  const dispatch = useAppDispatch();

  if (status !== "READY") {
    return <div>You should not be here</div>;
  }

  const onClose = () => dispatch(settingsModalClosed());
  return (
    <Stack direction={"row"} sx={{ height: "100vh" }}>
      <LeftMenuSidebar />
      <Divider orientation={"vertical"} />
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        <Modal open={settingsModalOpen} onClose={onClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1028,
              height: 728,
            }}
          >
            <BaseSettingsModal onClose={onClose} />
          </Box>
        </Modal>
        <Switch>
          <Route exact path={"/home"} render={() => <HomeScreen />} />
          <Route exact path={"/analyzer"} render={() => <ConnectedAnalyzer />} />
        </Switch>
      </Box>
    </Stack>
  );
}

export function RewindApp() {
  return (
    <Switch>
      <Route exact path={"/splash"} render={() => <ConnectedSplashScreen />} />
      <Route exact path={"/setup"} render={() => <ConnectedSetupScreen />} />
      <Route render={() => <NormalView />} />
    </Switch>
  );
}
