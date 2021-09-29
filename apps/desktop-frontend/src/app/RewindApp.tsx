import { useAppSelector } from "./hooks";
import { Route, Switch } from "react-router-dom"; // react-router v4/v5
import { LeftMenuSidebar } from "./LeftMenuSidebar";
// import { Theater } from "@rewind/feature-replay-viewer";
import { SplashScreen } from "./splash/SplashScreen";
import { SetupScreen } from "./setup/SetupScreen";
import { useEffect } from "react";
import { HomeScreen } from "./home/HomeScreen";
import { Box, Divider, Stack } from "@mui/material";
import { Analyzer } from "./analyzer/Analyzer";

function ConnectedTheater() {
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
        <Switch>
          <Route exact path={"/home"} render={() => <HomeScreen />} />
          <Route exact path={"/analyzer"} render={() => <ConnectedTheater />} />
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
