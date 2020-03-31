import Path from "./path";

export enum MessageType {
  NextPath
}

export interface BaseMessage {
  type: MessageType;
  nextPath: Path | undefined;
}

export interface NextPathMessage extends BaseMessage {
  type: MessageType.NextPath;
  nextPath: Path;
}

export type Message = NextPathMessage;

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
