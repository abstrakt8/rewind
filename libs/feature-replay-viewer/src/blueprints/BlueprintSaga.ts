import { call, put } from "redux-saga/effects";
import { parseBlueprint } from "@rewind/osu/core";
import { SagaIterator } from "redux-saga";
import { addRawBlueprint } from "./RawBlueprint";
import { RewindAPI } from "../api";

export function* retrieveBlueprint(blueprintId: string): SagaIterator {
  const options = {}; // Default options are fine for now
  const rawData: string = yield call(RewindAPI.getRawBlueprintByMd5, blueprintId);
  yield put(addRawBlueprint({ id: blueprintId, rawData }));
  return yield call(parseBlueprint, rawData, options);
}
