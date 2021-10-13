import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";
import { BehaviorSubject } from "rxjs";

export type BackendState = "NOT_STARTED" | "SETUP_MISSING" | "LOADING" | "READY";

@injectable()
export class BackendStatusService {
  status$: BehaviorSubject<BackendState>;

  constructor(@inject(TYPES.API_URL) private readonly apiUrl: string) {
    this.status$ = new BehaviorSubject<BackendState>("NOT_STARTED");
  }

  async wait() {
    await fetch(`${this.apiUrl}/status`);
  }
}
