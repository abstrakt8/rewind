import { Replay } from "node-osr";

export const ReplayWatchEvents = {
  ReplayRead: Symbol("ReplayDetected"),
  Ready: Symbol("Ready"),
};

export interface ReplayReadEvent {
  payload: {
    replay: Replay;
    filename: string;
    // Needed?
    path: string;
  };
}
