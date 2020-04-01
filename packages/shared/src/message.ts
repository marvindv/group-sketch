import Path from "./path";

export enum MessageType {
  EnterRoom,
  Text,
  NextPath
}

export interface BaseMessage {
  type: MessageType;
  nextPath?: Path | undefined;
  text?: string | undefined;
  roomId?: string | undefined;
}

export interface NextPathMessage extends BaseMessage {
  type: MessageType.NextPath;
  nextPath: Path;
  text?: undefined;
  roomId?: undefined;
}

export interface EnterRoomMessage extends BaseMessage {
  type: MessageType.EnterRoom;
  nextPath?: undefined;
  text?: undefined;
  roomId: string;
}

export interface TextMessage extends BaseMessage {
  type: MessageType.Text;
  nextPath?: undefined;
  text: string;
  roomId?: undefined;
}

export type Message = NextPathMessage | EnterRoomMessage | TextMessage;

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
