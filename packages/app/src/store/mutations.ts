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
   * Changes the `isConnected` state.
   *
   * Payload:
   *
   * ```
   * {
   *   isConnected: boolean;
   * }
   * ```
   */
  ChangeConnectionState = "CHANGE_CONNECTION_STATE",

  /**
   * Adjusts the state to indicate that the connection process is pending.
   *
   * Payload: {@link ConnectionPendingPayload}
   */
  ConnectPending = "CONNECT_PENDING",

  /**
   * Indicates that the connection attempt failed.
   *
   * Payload: {@link ConnectFailedPayload}
   */
  ConnectFailed = "CONNECT_FAILED",

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
  NextPath = "NEXT_PATH"
}

export interface ConnectionPendingPayload {
  nickname: string;
  roomId: string;
}

export interface ConnectFailedPayload {
  error: MessageError | number;
}

export default Mutation;
