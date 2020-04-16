import { Path } from "@group-sketch/shared";

export enum Action {
  /**
   * Connects to the backend.
   *
   * Payload: {@link ConnectPayload}
   */
  Connect = "CONNECT",

  /**
   * Disconnects from the backend.
   */
  Disconnect = "DISCONNECT",

  /**
   * Submits a new drawn path.
   *
   * Payload: {@link AddPathPayload}
   */
  AddPath = "ADD_PATH",

  /**
   * Undo the latest path. Client must be the sketcher.
   */
  UndoPath = "UNDO_PATH",

  /**
   * Clears the current sketching. Client must be the sketcher.
   */
  ClearSketching = "CLEAR_SKETCHING",

  /**
   * Requests the completion of the current sketching.
   *
   * Payload: {@link CompleteSketchingPayload}
   */
  CompleteSketching = "COMPLETE_SKETCHING"
}

export interface ConnectPayload {
  nickname: string;
  roomId: string;
}

export interface AddPathPayload {
  path: Path;
}

export interface CompleteSketchingPayload {
  rightGuessByNickname: string | null;
}

export default Action;
