import { useMobXContext } from "../contexts/MobXContext";

export const useScenarioService = () => {
  const { scenarioService } = useMobXContext();
  return scenarioService;
};
