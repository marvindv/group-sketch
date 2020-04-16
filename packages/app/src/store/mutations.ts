import { MessageError } from "@group-sketch/shared";

export enum Mutation {
  /**
   * Updates the join room form data.
   *
   * Payload:
   * ```
   * {
   *   roomId: string | null;
   *   nickname: string | null;
   * }
   * ```
   */
  UpdateJoinRoomForm = "UPDATE_JOIN_ROOM_FORM",

  /**
   * Adjusts the state to indicate that the connection process is pending.
   *
   * Payload: {@link ConnectPendingPayload}
   */
  ConnectPending = "CONNECT_PENDING",

  /**
   * Indicates that the connection attempt failed.
   *
   * Payload: {@link ConnectFailedPayload}
   */
  ConnectFailed = "CONNECT_FAILED",

  /**
   * Indicates that the connection attempt was successful and the connection to the backend is
   * established.
   */
  ConnectionEstablished = "CONNECTION_ESTABLISHED",

  /**
   * Indicates the the current connection to the backend was lost unexpectedly.
   *
   * Payload: {@link ConnectionLostPayload}
   */
  ConnectionLost = "CONNECTION_LOST",

  /**
   * Indicates the the current connection to the backend was closed under normal circumstances.
   */
  ConnectionClosed = "CONNECTION_CLOSED",

  /**
   * Indicates that this client is now in the process of joining a room.
   */
  JoiningRoom = "JOINING_ROOM",

  /**
   * Indicates that joining a room failed.
   *
   * Payload {@link RoomJoinFailedPayload}
   */
  RoomJoinFailed = "ROOM_JOIN_FAILED",

  /**
   * A room was successfully entered.
   *
   * Payload: {@link RoomEnteredMessage}
   */
  RoomEntered = "ROOM_ENTERED",

  /**
   * The connection to the current room was closed.
   */
  RoomLeft = "ROOM_LEFT",

  /**
   * Adds a new user to the state.
   *
   * Payload: {@link NewUserMessage}
   */
  NewUser = "NEW_USER",

  /**
   * Removes a user from the state.
   *
   * Payload: {@link UserLeftMessage}
   */
  UserLeft = "USER_LEFT",

  /**
   * Payload: {@link CompleteSketchingMessage}
   */
  RequestCompleteSketching = "REQUEST_COMPLETE_SKETCH",

  /**
   * Payload: {@link CompleteSketchingMessage}
   */
  SketchingCompleted = "SKETCHING_COMPLETED",

  /**
   * Sets the next sketcher.
   *
   * Payload: {@link NextSketcherMessage}
   */
  NextSketcher = "NEXT_SKETCHER",

  /**
   * Payload: {@link NextPathMessage}
   */
  RequestNextPath = "REQUEST_NEXT_PATH",

  /**
   * Adds a path to the sketchpad.
   *
   * Payload: {@link NextPathMessage}
   */
  NextPath = "NEXT_PATH",

  /**
   * The latest path by the sketcher was undone.
   */
  PathUndone = "PATH_UNDONE",

  /**
   * The whole sketching was cleared by the sketcher.
   */
  SketchingCleared = "SKETCHING_CLEARED"
}

export interface ConnectPendingPayload {
  nickname: string;
  roomId: string;
}

export interface ConnectFailedPayload {
  errorCode: MessageError | number;
}

export interface ConnectionLostPayload {
  errorCode: MessageError | number;
}

export interface RoomJoinFailedPayload {
  errorCode: MessageError | number;
}

export default Mutation;
