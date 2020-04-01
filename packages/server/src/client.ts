import * as WebSocket from "ws";
import {
  extractMessage,
  EnterRoomMessage,
  Message,
  MessageType,
  prepareMessage
} from "@group-sketch/shared";

import Room from "./room";
import { NextPathMessage } from "@group-sketch/shared";
import { TextMessage } from "@group-sketch/shared";

enum ClientState {
  AwaitRoom,
  Guesser,
  Sketcher
}

export default class Client {
  private state: ClientState = ClientState.AwaitRoom;
  private room: Room | undefined;

  constructor(private ws: WebSocket) {
    ws.on("message", data => {
      console.log("received: %s", data);

      const message = extractMessage(data.toString());
      switch (message.type) {
        case MessageType.EnterRoom:
          this.handleEnterRoom(message);
          break;

        case MessageType.NextPath:
          this.handleNextPath(message);
          break;

        case MessageType.Text:
          this.handleText(message);
          break;
      }
    });
  }

  send(message: Message) {
    this.ws.send(prepareMessage(message));
  }

  private handleEnterRoom(message: EnterRoomMessage) {
    if (this.state !== ClientState.AwaitRoom) {
      console.error(
        "Received EnterRoom from client in state",
        ClientState[this.state]
      );
      return;
    }

    this.state = ClientState.Sketcher;
    const room = Room.getById(message.roomId);
    if (!room) {
      console.error("User tried to access non existing room", room);
      return;
    }

    this.room = room;
    this.room.addClient(this);
  }

  private handleNextPath(message: NextPathMessage) {
    if (this.state !== ClientState.Sketcher) {
      console.error(
        "Received NextPath from client in state",
        ClientState[this.state]
      );
      return;
    }

    this.room?.broadcastPath(this, message.nextPath);
  }

  private handleText(message: TextMessage) {
    if (this.state !== ClientState.Guesser) {
      console.error(
        "Received Text from client in state",
        ClientState[this.state]
      );
      return;
    }
  }
}
