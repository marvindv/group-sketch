import Path from "./path";

/**
 * The possible error codes given as reasons for closed websocket connections.
 *
 * Custom error codes are allowed to be in the range between 4000 and 4999.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
export enum MessageError {
  /**
   * The error code indicating that there was actually no error. Is used when leaving a room.
   */
  NormalClosure = 1000,

  /**
   * Indicates that the connection was closed abnormally, i.e. without a close frame.
   *
   * Reserved value, which means is only received as an error code, cannot be used as a status code
   * for close manually.
   */
  AbnormalClosure = 1006,

  InvalidPayload = 4000,
  RoomNotFound,
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
  UndoPath,
  ClearSketching,
  CompleteSketching,
  NextSketcher
}

export interface NextPathMessage {
  type: MessageType.NextPath;
  nextPath: Path;
}

/**
 * The sketcher sends this message to undo the last drawn path. The message is then broadcasted by
 * the backend to all clients in the room of the sketcher.
 */
export interface UndoPathMessage {
  type: MessageType.UndoPath;
}

/**
 * The sketcher sends this message to clear the current skeching to start all over. The message is
 * then broadcasted by the backend to all clients in the room of the sketcher.
 */
export interface ClearSketchingMessage {
  type: MessageType.ClearSketching;
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
  currentSketching: Path[] | undefined;
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
  | UndoPathMessage
  | ClearSketchingMessage
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
