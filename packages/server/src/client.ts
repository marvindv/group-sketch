import * as WebSocket from "ws";
import {
  extractMessage,
  EnterRoomMessage,
  Message,
  MessageType,
  prepareMessage,
  MessageError,
  NextPathMessage,
  TextMessage,
  CompleteSketchingMessage
} from "@group-sketch/shared";

import Room from "./room";

enum ClientState {
  AwaitRoom,
  Guesser,
  Sketcher
}
export default class Client {
  private state: ClientState = ClientState.AwaitRoom;
  private room: Room | undefined;
  private nickname: string | undefined;

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

        case MessageType.CompleteSketching:
          this.handleCompleteSketching(message);
          break;
      }
    });

    ws.on("close", () => {
      if (this.room) {
        console.log("Remove connection");
        this.room.removeClient(this);
      }
    });
  }

  getNickname(): string | undefined {
    return this.nickname;
  }

  setSketcher(isSketcher: boolean) {
    this.state = isSketcher ? ClientState.Sketcher : ClientState.Guesser;
  }

  send(message: Message) {
    console.log("SEND to", this.nickname + ":", message);
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

    this.state = ClientState.Guesser;
    const room = Room.getById(message.roomId);
    if (!room) {
      console.error("User tried to access non existing room", message.roomId);
      this.ws.close(MessageError.RoomNotFound);
      return;
    }

    const nickname = message.nickname.trim();
    if (room.hasClient(nickname)) {
      console.error(
        "User tried to access room",
        message.roomId,
        "with existing nickname",
        nickname
      );
      this.ws.close(MessageError.NicknameInUse);
      return;
    }

    this.room = room;
    this.nickname = nickname;
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

  private handleCompleteSketching(message: CompleteSketchingMessage) {
    if (this.state !== ClientState.Sketcher) {
      console.error(
        "Received CompleteSketching from client in state",
        ClientState[this.state]
      );
      return;
    }

    this.room!.completeSketching(message);
  }
}
