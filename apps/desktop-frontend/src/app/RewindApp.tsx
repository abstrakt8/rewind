import "./main.css";
import { useAppSelector } from "./hooks";
import { Route, Switch } from "react-router"; // react-router v4/v5
import { LeftMenuSidebar } from "./LeftMenuSidebar";
import { Theater } from "@rewind/feature-replay-viewer";
import { SplashScreen } from "./splash/SplashScreen";

function ConnectedTheater() {
  const { chosenBlueprintId, chosenReplayId } = useAppSelector((state) => state.theater);
  return <Theater chosenBlueprintId={chosenBlueprintId} chosenReplayId={chosenReplayId} />;
}

function ConnectedSplashScreen() {
  return <SplashScreen status={"LOADING"} />;
}

function Home() {
  return <div>Home</div>;
}

function NormalView() {
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
      <Route render={() => <NormalView />} />
    </Switch>
  );
}
