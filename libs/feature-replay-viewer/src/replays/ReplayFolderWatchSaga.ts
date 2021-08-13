import { call, put, take } from "redux-saga/effects";
import { io, Socket } from "socket.io-client";
import { eventChannel, SagaIterator } from "redux-saga";
import { scenarioChangeRequested } from "../theater/actions";

function createWebSocketConnection(url: string) {
  const socket = io(url);
  socket.on("connect", () => {
    console.log("Connected to WebSocket");
  });
  return socket;
}

type Payload = {
  blueprintId: string;
  replayId: string;
};

// Mainly from https://redux-saga.js.org/docs/advanced/Channels
function createSocketChannel(socket: Socket) {
  return eventChannel((emit) => {
    const replayAddedHandler = (replay: { filename: string }, beatmapMetaData: { md5Hash: string }) => {
      const { md5Hash } = beatmapMetaData;
      console.log(`Replay added: ${replay.filename}, ${md5Hash}`);
      const blueprintId = md5Hash;
      const replayId = replay.filename;
      const payload: Payload = { blueprintId, replayId };
      emit(payload);
    };

    const errorHandler = (errorEvent: any) => {
      emit(new Error(errorEvent.reason));
    };

    socket.on("replayAdded", replayAddedHandler);
    socket.on("error", errorHandler);

    const unsubscribe = () => {
      // socket.close();
    };
    return unsubscribe;
  });
}

export function* watchReplaysAdded(url: string): SagaIterator {
  const socket = yield call(createWebSocketConnection, url);
  const channel = yield call(createSocketChannel, socket);

  while (true) {
    try {
      const payload: Payload = yield take(channel);
      yield put(scenarioChangeRequested(payload));
    } catch (err) {
      console.error("Socket error: ", err);
    }
  }
}
