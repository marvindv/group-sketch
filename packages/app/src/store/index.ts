import {
  CompleteSketchingMessage,
  MessageError,
  MessageType,
  NewUserMessage,
  NextPathMessage,
  NextSketcherMessage,
  Path,
  RoomEnteredMessage,
  UserLeftMessage
} from "@group-sketch/shared";
import Vue from "vue";
import Vuex from "vuex";

import createBackendPlugin from "@/api/backend-plugin";
import config from "@/config";
import User from "@/models/user";
import Action, {
  AddPathPayload,
  CompleteSketchingPayload,
  ConnectPayload
} from "@/store/actions";
import Mutation, {
  ConnectionPendingPayload,
  ConnectFailedPayload
} from "@/store/mutations";

export interface State {
  // Home view state:
  joinRoomForm: {
    roomId: string | null;
    nickname: string | null;
  };

  // Room state:
  isConnected: boolean;
  connectFailureError: MessageError | null;
  /**
   * The value indicating whether this client was already connected and lost the connection.
   *
   * @type {boolean}
   * @memberof State
   */
  connectionLost: boolean;
  connectRequestData: {
    nickname: string;
    roomId: string;
  } | null;
  roomId: string | null;
  users: User[];
  guessWord: string | null;
  chatEntries: string[];
  sketchPaths: Path[];
}

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store<State>({
  strict: debug,
  plugins: [createBackendPlugin(config.apiAddress())],
  state: {
    joinRoomForm: {
      roomId: null,
      nickname: null
    },

    isConnected: false,
    connectFailureError: null,
    connectionLost: false,
    connectRequestData: null,
    roomId: null,
    users: [],
    guessWord: null,
    chatEntries: [],
    sketchPaths: []
  },
  getters: {
    /**
     * The user object representing this client.
     */
    thisUser: state => state.users.find(u => u.thatsYou),

    /**
     * The value indicating whether the current user is the current sketcher.
     */
    isSketcher: (_, getters) => getters.thisUser?.isSketcher || false
  },
  mutations: {
    [Mutation.UpdateJoinRoomForm](
      state,
      payload: { roomId: string | null; nickname: string | null }
    ) {
      state.joinRoomForm = { ...payload };
    },

    [Mutation.ChangeConnectionState](state, payload: { isConnected: boolean }) {
      state.connectionLost = !payload.isConnected && state.isConnected;
      state.isConnected = payload.isConnected;
    },

    [Mutation.ConnectPending](state, payload: ConnectionPendingPayload) {
      state.connectRequestData = { ...payload };
    },

    [Mutation.ConnectFailed](state, payload: ConnectFailedPayload) {
      state.connectFailureError = payload.error;
    },

    [Mutation.RoomEntered](state, payload: RoomEnteredMessage) {
      state.users = [
        {
          nickname: state.connectRequestData?.nickname!,
          isSketcher: false,
          thatsYou: true,
          correctGuesses: 0
        },
        ...payload.nicknames.map(n => ({
          isSketcher: n === payload.currentSketcher,
          nickname: n,
          thatsYou: false,
          correctGuesses: 0
        }))
      ];
      state.roomId = state.connectRequestData?.roomId || null;
      state.connectRequestData = null;
      state.chatEntries = [...state.chatEntries, "Willkommen"];
    },

    [Mutation.NewUser](state, payload: NewUserMessage) {
      state.users = [
        ...state.users,
        {
          isSketcher: false,
          nickname: payload.nickname,
          thatsYou: false,
          correctGuesses: 0
        }
      ];
      state.chatEntries = [
        ...state.chatEntries,
        "Neuer Kumpel: " + payload.nickname
      ];
    },

    [Mutation.UserLeft](state, payload: UserLeftMessage) {
      state.users = state.users.filter(u => u.nickname !== payload.nickname);
      state.chatEntries = [
        ...state.chatEntries,
        "Kumpel ist abgehauen: " + payload.nickname
      ];
    },

    [Mutation.RequestCompleteSketching]() {
      return;
    },

    [Mutation.SketchingCompleted](state, payload: CompleteSketchingMessage) {
      if (payload.rightGuessByNickname === null) {
        state.chatEntries = [
          ...state.chatEntries,
          `Keiner hat "${payload.guessWord}" erraten.`
        ];
      } else {
        state.chatEntries = [
          ...state.chatEntries,
          `"${payload.guessWord}" richtig geraten von: ${payload.rightGuessByNickname}`
        ];
      }
    },

    [Mutation.NextSketcher](state, payload: NextSketcherMessage) {
      state.users = state.users.map(u => ({
        ...u,
        isSketcher: u.nickname === payload.nickname
      }));

      // If this user gets the guess word, it means he/she is the current sketcher.
      // If not, reset `guessWord` to `null`.
      state.guessWord = payload.guessWord || null;
    },

    [Mutation.RequestNextPath]() {
      return;
    },

    [Mutation.NextPath](state, payload: NextPathMessage) {
      state.sketchPaths = [...state.sketchPaths, payload.nextPath];
    }
  },

  actions: {
    [Action.Connect](context, payload: ConnectPayload) {
      context.commit(Mutation.ConnectPending, payload);
    },

    [Action.AddPath](context, payload: AddPathPayload) {
      const newPayload: NextPathMessage = {
        type: MessageType.NextPath,
        nextPath: payload.path
      };
      context.commit(Mutation.RequestNextPath, newPayload);
    },

    [Action.CompleteSketching](context, payload: CompleteSketchingPayload) {
      const message: CompleteSketchingMessage = {
        type: MessageType.CompleteSketching,
        rightGuessByNickname: payload.rightGuessByNickname
      };
      context.commit(Mutation.RequestCompleteSketching, message);
    }
  }
});
