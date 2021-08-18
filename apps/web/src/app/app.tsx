import { GameStage, StageProvider, useTheaterContext } from "@rewind/feature-replay-viewer";
import { useEffect, useState } from "react";
import { RewindStage } from "../../../../libs/feature-replay-viewer/src/app/stage";
import { useAppSelector } from "../../../../libs/feature-replay-viewer/src/hooks";
// export function App() {
//   const { scenarioService, preferencesService } = useMobXContext();
//   useEffect(() => {
//     preferencesService.changePreferredSkin(chosenSkinId);
//     Promise.all([scenarioService.changeScenario(chosenBlueprintId, chosenReplayId)]).then(() => {
//       console.log(`Finished loading ${chosenBlueprintId} with skin ${chosenSkinId}`);
//     });
//   }, [scenarioService, chosenBlueprintId, chosenReplayId, chosenSkinId]);
//   return <FeatureReplayViewer />;
// }

function Stage() {
  const { chosenBlueprintId, chosenReplayId } = useAppSelector((state) => state.theater);

  const { createStage, isCreatingStage } = useTheaterContext();
  const [stage, setStage] = useState<RewindStage | null>(null);

  useEffect(() => {
    if (chosenBlueprintId === null) {
      return;
    }
    console.log(`Creating stage with ${chosenBlueprintId} and ${chosenReplayId}`);
    createStage(chosenBlueprintId, chosenReplayId).then((createdStage) => setStage(createdStage));
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

  if (isCreatingStage || !stage) {
    return <div>Preparing the stage...</div>;
  }

  return (
    <StageProvider stage={stage}>
      <GameStage />
    </StageProvider>
  );
}

export function App() {
  return (
    <div>
      <Stage />
    </div>
  );
}

export default App;
