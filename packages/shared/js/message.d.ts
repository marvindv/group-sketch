import Path from "./path";
export declare enum MessageType {
    EnterRoom = 0,
    Text = 1,
    NextPath = 2
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
export declare type Message = NextPathMessage | EnterRoomMessage | TextMessage;
export declare function extractMessage(messageData: string): Message;
export declare function prepareMessage(event: Message): string;
