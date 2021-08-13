import { call, put } from "redux-saga/effects";
import { RewindAPI } from "../api";
import { SagaIterator } from "redux-saga";
import { modsFromBitmask, parseReplayFramesFromRaw, RawReplayData } from "@rewind/osu/core";
import { OsuReplay, replayAdded } from "./slice";

export function* retrieveReplay(replayId: string): SagaIterator {
  const raw: RawReplayData = yield call(RewindAPI.getReplayById, replayId);
  const replay: OsuReplay = {
    gameVersion: raw.gameVersion,
    frames: parseReplayFramesFromRaw(raw.replay_data),
    mods: modsFromBitmask(raw.mods),
    md5hash: raw.replayMD5,
    player: "",
  };
  yield put(replayAdded(replay));
  return replay;
}
