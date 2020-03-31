import Path from "./path";
export declare enum MessageType {
    NextPath = 0
}
export interface BaseMessage {
    type: MessageType;
    nextPath: Path | undefined;
}
export interface NextPathMessage extends BaseMessage {
    type: MessageType.NextPath;
    nextPath: Path;
}
export declare type Message = NextPathMessage;
export declare function extractMessage(messageData: string): Message;
export declare function prepareMessage(event: Message): string;
