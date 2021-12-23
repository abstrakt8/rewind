import { useAppSelector } from "./hooks/hooks";
import { Route, Switch } from "react-router-dom"; // react-router v4/v5
import { LeftMenuSidebar } from "./LeftMenuSidebar";
import { SplashScreen } from "./splash/SplashScreen";
import { SetupScreen } from "./setup/SetupScreen";
import { HomeScreen } from "./home/HomeScreen";
import { Box, Divider, Stack } from "@mui/material";
import { Analyzer } from "@rewind/feature-replay-viewer";
import { UpdateModal } from "./UpdateModal";

function ConnectedAnalyzer() {
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
          <Route exact={true} path={"/home"} render={() => <HomeScreen />} />
          <Route exact path={"/analyzer"} render={() => <ConnectedAnalyzer />} />
        </Switch>
      </Box>
      <UpdateModal />
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
