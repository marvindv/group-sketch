import Path from "./path";

/**
 * The possible error resonse codes used for handling messages. Since the error code is passed to
 * websocket.close it must start be between 4000 and 4999.
 * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
export enum MessageError {
  RoomNotFound = 4000,
  NicknameInUse,
  Other
}

export enum MessageType {
  EnterRoom,
  RoomEntered,
  NewUser,
  UserLeft,
  Text,
  NextPath,
  CompleteSketching,
  NextSketcher
}

export interface NextPathMessage {
  type: MessageType.NextPath;
  nextPath: Path;
}

export interface EnterRoomMessage {
  type: MessageType.EnterRoom;
  roomId: string;
  nickname: string;
}

export interface RoomEnteredMessage {
  type: MessageType.RoomEntered;
  nicknames: string[];
  currentSketcher: string | undefined;
}

export interface NewUserMessage {
  type: MessageType.NewUser;
  nickname: string;
}

export interface UserLeftMessage {
  type: MessageType.UserLeft;
  nickname: string;
}

export interface TextMessage {
  type: MessageType.Text;
  text: string;
}

/**
 * The sketcher sends this message to end the sketching. Contains the right guesser if there was
 * one. Is then broadcasted with the attached guess-word to all clients by the server.
 */
export interface CompleteSketchingMessage {
  type: MessageType.CompleteSketching;
  /**
   * Is `null` if no one guessed right.
   */
  rightGuessByNickname: string | null;

  /**
   * The actual guess word. Is attached by the server on broadcast.
   */
  guessWord?: string;
}

export interface NextSketcherMessage {
  type: MessageType.NextSketcher;

  /**
   * The nickname of the user to sketch.
   */
  nickname: string;

  /**
   * Is attached only for the guesser.
   */
  guessWord?: string;
}

export type Message =
  | NextPathMessage
  | EnterRoomMessage
  | RoomEnteredMessage
  | NewUserMessage
  | UserLeftMessage
  | TextMessage
  | CompleteSketchingMessage
  | NextSketcherMessage;

export function extractMessage(messageData: string): Message {
  let json: any;
  try {
    json = JSON.parse(messageData);
  } catch (err) {
    throw new Error("Invalid format " + event);
  }

  if (typeof json.type !== "number") {
    throw new Error("Invalid message format");
  }

  return json as Message;
}

export function prepareMessage(event: Message): string {
  return JSON.stringify(event);
}
