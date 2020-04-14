import {
  CompleteSketchingMessage,
  extractMessage,
  Message,
  MessageType,
  NextPathMessage,
  prepareMessage,
  MessageError
} from "@group-sketch/shared";
import { Store } from "vuex";

import State from "@/store/state";
import Action from "@/store/actions";
import Mutation, {
  ConnectPendingPayload,
  ConnectFailedPayload,
  ConnectionLostPayload,
  RoomJoinFailedPayload
} from "@/store/mutations";

/**
 * Encapsulated the websocket connection to the backend. Transmits data using the connection on
 * certain store mutations and commits specific mutations on new messages received from the backend.
 *
 * @export
 * @param {string} apiAddress The backend api address.
 * @returns
 */
export default function createBackendPlugin(apiAddress: string) {
  let ws: WebSocket | undefined;

  // Sends a message using the connection.
  function send(message: Message) {
    ws?.send(prepareMessage(message));
  }

  return (store: Store<State>) => {
    store.subscribeAction(action => {
      switch (action.type) {
        case Action.Disconnect: {
          ws?.close(MessageError.NormalClosure);
          break;
        }
      }
    });

    store.subscribe((mutation, state) => {
      switch (mutation.type) {
        case Mutation.ConnectPending: {
          // Initiate the websocket connection to the backend. Add event listeners and commit
          // mutations on certain events.
          const {
            nickname,
            roomId
          } = mutation.payload as ConnectPendingPayload;
          ws = new WebSocket(apiAddress);

          ws.addEventListener("open", () => {
            store.commit(Mutation.ConnectionEstablished);
            store.commit(Mutation.JoiningRoom);
            send({ type: MessageType.EnterRoom, nickname, roomId });
          });

          ws.addEventListener("close", event => {
            store.commit(Mutation.RoomLeft);

            if (event.code === MessageError.NormalClosure) {
              store.commit(Mutation.ConnectionClosed);
            } else {
              console.error(
                `Connection closed: ${event.code}: ${MessageError[event.code]}`,
                event
              );

              if (state.isConnected) {
                if (state.joinRoomPending) {
                  store.commit(Mutation.RoomJoinFailed, {
                    errorCode: event.code
                  } as RoomJoinFailedPayload);
                } else {
                  store.commit(Mutation.ConnectionLost, {
                    errorCode: event.code
                  } as ConnectionLostPayload);
                }
              } else {
                store.commit(Mutation.ConnectFailed, {
                  errorCode: event.code
                } as ConnectFailedPayload);
              }
            }
          });

          ws.addEventListener("error", err => {
            console.error("Socket error:", err);
            ws?.close();
            ws = undefined;
          });

          ws.addEventListener("message", event => {
            const message = extractMessage(event.data);
            switch (message.type) {
              case MessageType.RoomEntered:
                store.commit(Mutation.RoomEntered, message);
                break;
              case MessageType.NewUser:
                store.commit(Mutation.NewUser, message);
                break;
              case MessageType.UserLeft:
                store.commit(Mutation.UserLeft, message);
                break;
              case MessageType.NextSketcher:
                store.commit(Mutation.NextSketcher, message);
                break;
              case MessageType.NextPath:
                store.commit(Mutation.NextPath, message);
                break;
              case MessageType.CompleteSketching:
                store.commit(Mutation.SketchingCompleted, message);
                break;
            }
          });

          break;
        }

        case Mutation.RequestNextPath: {
          const payload = mutation.payload as NextPathMessage;
          send(payload);
          break;
        }

        case Mutation.RequestCompleteSketching: {
          const payload = mutation.payload as CompleteSketchingMessage;
          send(payload);
          break;
        }
      }
    });
  };
}
