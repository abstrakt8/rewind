import { useAppSelector } from "../hooks";
import { useEffect, useState } from "react";
import { RewindStage } from "../app/stage";
import { useTheaterContext } from "./components/TheaterProvider/TheaterProvider";
import { StageProvider } from "./components/StageProvider/StageProvider";
import { GameStage } from "./GameStage";

export function Theater() {
  const { chosenBlueprintId, chosenReplayId } = useAppSelector((state) => state.theater);

  const { createStage } = useTheaterContext();
  const [stage, setStage] = useState<RewindStage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chosenBlueprintId === null || chosenReplayId === null) {
      return;
    }
    console.log(`Creating stage with ${chosenBlueprintId} and ${chosenReplayId}!`);
    setLoading(true);
    createStage(chosenBlueprintId, chosenReplayId).then((createdStage) => {
      setStage(createdStage);
      setLoading(false);
    });
  }, [createStage, chosenBlueprintId, chosenReplayId]);

  // In case the stage changes, we need to clean it up
  useEffect(() => {
    return () => {
      stage?.destroy();
    };
  }, [stage]);

  if (chosenBlueprintId === null) {
    return <div>No blueprint chosen, try using F2.</div>;
  }

  if (loading || !stage) {
    return <div>Preparing the stage...</div>;
  }

  /* TODO: This is very hacky right now. The StageProvider is forced to be teared down

  */

  return (
    <StageProvider stage={stage}>
      <GameStage />
    </StageProvider>
  );
}
