import User from "@/models/user";
import { MessageError, Path } from "@group-sketch/shared";

export default interface State {
  // Home view state:
  joinRoomForm: {
    roomId: string | null;
    nickname: string | null;
  };

  // Room state:
  isConnectPending: boolean;

  /**
   * The value indicating whether this client is connected to the backend, but necessarily joined
   * a room.
   *
   * @type {boolean}
   * @memberof State
   */
  isConnected: boolean;

  connectFailureError: MessageError | null;

  /**
   * The value indicating whether this client was already connected and lost the connection.
   *
   * @type {boolean}
   * @memberof State
   */
  connectionLost: boolean;

  connectAndJoinRoomRequestData: {
    nickname: string;
    roomId: string;
  } | null;

  /**
   * The value indicating whether this client is in the process of joining a room, i.e. waiting for
   * the backend response.
   *
   * @type {boolean}
   * @memberof State
   */
  joinRoomPending: boolean;

  joinRoomError: MessageError | null;

  roomId: string | null;

  users: User[];

  guessWord: string | null;

  chatEntries: string[];

  sketchPaths: Path[];
}
