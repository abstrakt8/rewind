import { useEffect, useState } from "react";
import { RewindStage } from "../app/stage/createRewindStage";
import { useTheaterContext } from "./components/TheaterProvider/TheaterProvider";
import { StageProvider } from "./components/StageProvider/StageProvider";
import { GameStage } from "./GameStage";
import { SyncLoader } from "react-spinners";
import { LightningBoltIcon } from "@heroicons/react/solid";

function TheaterPreparation() {
  return (
    <div className={"flex flex-col items-center gap-4 justify-center text-white m-auto text-gray-200"}>
      <SyncLoader loading={true} color={"white"} />
      <div>Preparing the stage...</div>
    </div>
  );
}

function TheaterEmpty() {
  return (
    <div className={"flex flex-col items-center gap-4 justify-center text-white m-auto text-gray-200 p-4"}>
      <LightningBoltIcon className={"h-16 w-16"} />
      <div>In osu! press F2 while being at a score/fail screen to load the replay</div>
    </div>
  );
}

interface Props {
  chosenBlueprintId: string | null;
  chosenReplayId: string | null;
}

export function Theater({ chosenBlueprintId, chosenReplayId }: Props) {
  // const { chosenBlueprintId, chosenReplayId } = useAppSelector((state) => state.theater);

  const { theater } = useTheaterContext();
  const [stage, setStage] = useState<RewindStage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chosenBlueprintId === null || chosenReplayId === null) {
      return;
    }
    console.log(`Creating stage with ${chosenBlueprintId} and ${chosenReplayId}!`);
    setLoading(true);
    theater.createStage(chosenBlueprintId, chosenReplayId).then((createdStage) => {
      setStage(createdStage);
      setLoading(false);
    });
  }, [theater, chosenBlueprintId, chosenReplayId]);

  // In case the stage changes, we need to clean it up
  useEffect(() => {
    return () => {
      stage?.destroy();
    };
  }, [stage]);

  if (chosenBlueprintId === null) {
    return <TheaterEmpty />;
  }

  if (loading || !stage) {
    return <TheaterPreparation />;
  }

  /* TODO: This is very hacky right now. The StageProvider is forced to be teared down

  */

  return (
    <StageProvider stage={stage}>
      <GameStage />
    </StageProvider>
  );
}
