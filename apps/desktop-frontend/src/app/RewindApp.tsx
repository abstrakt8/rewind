import "./main.css";
import { useAppSelector } from "./hooks";
import { Route, Switch } from "react-router"; // react-router v4/v5
import { LeftMenuSidebar } from "./LeftMenuSidebar";
import { Theater } from "@rewind/feature-replay-viewer";
import { SplashScreen } from "./splash/SplashScreen";
import { SetupScreen } from "./setup/SetupScreen";
import { useEffect } from "react";

function ConnectedTheater() {
  const { chosenBlueprintId, chosenReplayId } = useAppSelector((state) => state.theater);
  useEffect(() => {
    console.log(`Theater is now constructing a stage with blueprintId=${chosenBlueprintId} replayId=${chosenReplayId}`);
  }, [chosenReplayId, chosenBlueprintId]);
  return <Theater chosenBlueprintId={chosenBlueprintId} chosenReplayId={chosenReplayId} />;
}

function ConnectedSplashScreen() {
  const status = useAppSelector((state) => state.backend.status);
  return <SplashScreen status={status} />;
}

function ConnectedSetupScreen() {
  return <SetupScreen />;
}

function Home() {
  return <div>Home</div>;
}

function NormalView() {
  const { status } = useAppSelector((state) => state.backend);

  if (status !== "READY") {
    return <div>You should not be here</div>;
  }
  return (
    <div className={"bg-gray-800 flex h-screen"}>
      <LeftMenuSidebar />

      <Switch>
        <Route exact path={"/"} render={() => <Home />} />
        <Route exact path={"/theater"} render={() => <ConnectedTheater />} />
      </Switch>
    </div>
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
