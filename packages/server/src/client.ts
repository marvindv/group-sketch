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

    ws.on("error", err => {
      console.log("Error on connection");
      this.room?.removeClient(this);
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

  /**
   * The client can enter a room with a nickname and a room id. The client must be in the AwaitRoom
   * state. The room must already exist and the nickname must not be in use already in that room.
   *
   * @private
   * @param {Partial<EnterRoomMessage>} message
   * @returns
   * @memberof Client
   */
  private handleEnterRoom(message: Partial<EnterRoomMessage>) {
    if (this.state !== ClientState.AwaitRoom) {
      console.error(
        "Received EnterRoom from client in state",
        ClientState[this.state]
      );
      return;
    }

    // Validate the payload.
    if (
      typeof message.roomId !== "string" ||
      typeof message.nickname !== "string"
    ) {
      console.error("User tried to access room with invalid payload", message);
      this.ws.close(MessageError.InvalidPayload);
      return;
    }

    // Find the room and add the user if there is no nickname conflict.
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

  /**
   * The client sent a new sketch path. The client must be in the Sketcher state.
   *
   * @private
   * @param {Partial<NextPathMessage>} message
   * @returns
   * @memberof Client
   */
  private handleNextPath(message: Partial<NextPathMessage>) {
    if (this.state !== ClientState.Sketcher) {
      console.error(
        "Received NextPath from client in state",
        ClientState[this.state]
      );
      return;
    }

    // Validate the payload.
    if (
      !Array.isArray(message.nextPath) ||
      // Each point must be a 2-tuple.
      message.nextPath.some(path => !Array.isArray(path) || path.length !== 2)
    ) {
      console.error(
        "User tries to submit next path with invalid payload.",
        message
      );
      return;
    }

    this.room?.broadcastPath(this, message.nextPath);
  }

  /**
   * Not yet implemented.
   *
   * @private
   * @param {TextMessage} message
   * @returns
   * @memberof Client
   */
  private handleText(message: TextMessage) {
    if (this.state !== ClientState.Guesser) {
      console.error(
        "Received Text from client in state",
        ClientState[this.state]
      );
      return;
    }
  }

  /**
   * Handle the completion of a sketching. The client must be in the Sketcher state.
   *
   * @private
   * @param {CompleteSketchingMessage} message
   * @returns
   * @memberof Client
   */
  private handleCompleteSketching(message: CompleteSketchingMessage) {
    if (this.state !== ClientState.Sketcher) {
      console.error(
        "Received CompleteSketching from client in state",
        ClientState[this.state]
      );
      return;
    }

    // Validate the payload.
    if (
      message.rightGuessByNickname !== null &&
      typeof message.rightGuessByNickname !== "string"
    ) {
      console.error(
        "User tried to complete sketching with invalid payload.",
        message
      );
      return;
    }

    this.room!.completeSketching(message);
  }
}
