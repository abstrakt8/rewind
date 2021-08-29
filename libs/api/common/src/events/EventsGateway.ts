import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";
import { ReplayReadEvent, ReplayWatchEvents } from "./Events";
import { LocalBlueprintService } from "../blueprints/LocalBlueprintService";

// https://gabrieltanner.org/blog/nestjs-realtime-chat

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server: Server;

  constructor(private blueprintService: LocalBlueprintService) {}

  private logger: Logger = new Logger("EventsGateway");

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  @OnEvent(ReplayWatchEvents.ReplayRead)
  async handleReplayAdded(event: ReplayReadEvent) {
    const { replay, filename } = event.payload;
    const blueprintMetaData = await this.blueprintService.getBlueprintByMD5(replay.beatmapMD5);

    this.logger.log("Replay added ", replay.replayMD5);
    this.server.emit("replayAdded", { filename }, blueprintMetaData);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
