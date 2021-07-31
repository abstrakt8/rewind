import { makeAutoObservable } from "mobx";
import { Blueprint } from "@rewind/osu/core";
import { OsuExpressBlueprintManager } from "../managers/BlueprintManager";

export class BlueprintStore {
  constructor() {
    makeAutoObservable(this);
  }

  async loadBlueprint(id: string): Promise<Blueprint> {
    const b = new OsuExpressBlueprintManager("http://localhost:7271");
    return b.loadBlueprint(id);
  }
}
