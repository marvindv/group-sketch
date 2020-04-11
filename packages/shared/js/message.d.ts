import Path from "./path";
/**
 * The possible error resonse codes used for handling messages. Since the error code is passed to
 * websocket.close it must start be between 4000 and 4999.
 * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
export declare enum MessageError {
    InvalidPayload = 4000,
    RoomNotFound = 4001,
    NicknameInUse = 4002,
    Other = 4003
}
export declare enum MessageType {
    EnterRoom = 0,
    RoomEntered = 1,
    NewUser = 2,
    UserLeft = 3,
    Text = 4,
    NextPath = 5,
    CompleteSketching = 6,
    NextSketcher = 7
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
export declare type Message = NextPathMessage | EnterRoomMessage | RoomEnteredMessage | NewUserMessage | UserLeftMessage | TextMessage | CompleteSketchingMessage | NextSketcherMessage;
export declare function extractMessage(messageData: string): Message;
export declare function prepareMessage(event: Message): string;
