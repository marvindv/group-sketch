export enum Mutation {
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
   * A room was successfully entered.
   *
   * Payload: {@link RoomEnteredMessage}
   */
  RoomEntered = "ROOM_ENTERED",

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

export default Mutation;
