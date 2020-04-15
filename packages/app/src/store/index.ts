import {
  CompleteSketchingMessage,
  MessageType,
  NewUserMessage,
  NextPathMessage,
  NextSketcherMessage,
  RoomEnteredMessage,
  UserLeftMessage
} from "@group-sketch/shared";
import Vue from "vue";
import Vuex from "vuex";

import createBackendPlugin from "@/api/backend-plugin";
import config from "@/config";
import Action, {
  AddPathPayload,
  CompleteSketchingPayload,
  ConnectPayload
} from "@/store/actions";
import Mutation, {
  ConnectPendingPayload,
  ConnectFailedPayload,
  ConnectionLostPayload,
  RoomJoinFailedPayload
} from "@/store/mutations";
import State from "./state";

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

    isConnectPending: false,
    isConnected: false,
    connectFailureError: null,
    connectionLost: false,
    connectAndJoinRoomRequestData: null,
    joinRoomPending: false,
    joinRoomError: null,
    roomId: null,
    users: [],
    guessWord: null,
    chatEntries: [],
    sketchPaths: []
  },
  getters: {
    /**
     * The value indicating whether this client is currently connecting to the backend and joining
     * a room.
     */
    isConnectingToRoom: state =>
      state.isConnectPending || state.joinRoomPending,

    /**
     * The user object representing this client.
     */
    thisUser: state => state.users.find(u => u.thatsYou),

    /**
     * The list of users sorted from the user with the most to the user with the least correct
     * guesses. Users with the same number of correct guesses are sorted by their nickname.
     */
    sortedUsers: state =>
      state.users.slice().sort((a, b) => {
        if (a.correctGuesses === b.correctGuesses) {
          return a.nickname.localeCompare(b.nickname);
        }

        return b.correctGuesses - a.correctGuesses;
      }),

    /**
     * The current sketcher or `undefined` if there is none.
     */
    currentSketcher: state => state.users.find(u => u.isSketcher),

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
      state.connectFailureError = null;
      state.joinRoomError = null;
    },

    [Mutation.ConnectPending](state, payload: ConnectPendingPayload) {
      state.isConnectPending = true;
      state.connectFailureError = null;
      state.connectAndJoinRoomRequestData = { ...payload };
    },

    [Mutation.ConnectFailed](state, payload: ConnectFailedPayload) {
      state.isConnectPending = false;
      state.connectionLost = false;
      state.connectFailureError = payload.errorCode;
      state.connectAndJoinRoomRequestData = null;
    },

    [Mutation.ConnectionEstablished](state) {
      state.isConnectPending = false;
      state.connectFailureError = null;
      state.connectionLost = false;
      state.isConnected = true;
    },

    [Mutation.ConnectionLost](state, _payload: ConnectionLostPayload) {
      // TODO: Should we do something with the error code?
      state.connectionLost = true;
      state.isConnected = false;
    },

    [Mutation.ConnectionClosed](state) {
      state.connectionLost = false;
      state.isConnected = false;
    },

    [Mutation.JoiningRoom](state) {
      state.joinRoomPending = true;
    },

    [Mutation.RoomJoinFailed](state, payload: RoomJoinFailedPayload) {
      state.connectionLost = false;
      state.joinRoomPending = false;
      state.joinRoomError = payload.errorCode;
    },

    [Mutation.RoomEntered](state, payload: RoomEnteredMessage) {
      state.joinRoomPending = false;
      state.users = [
        {
          nickname: state.connectAndJoinRoomRequestData?.nickname!,
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
      state.roomId = state.connectAndJoinRoomRequestData?.roomId || null;
      state.chatEntries = [...state.chatEntries, "Willkommen"];
      state.connectAndJoinRoomRequestData = null;
      state.sketchPaths = payload.currentSketching
        ? [...payload.currentSketching]
        : [];
    },

    [Mutation.RoomLeft](state) {
      state.chatEntries = [];
      state.guessWord = null;
      state.roomId = null;
      state.sketchPaths = [];
      state.users = [];
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
        "Neuer Spieler: " + payload.nickname
      ];
    },

    [Mutation.UserLeft](state, payload: UserLeftMessage) {
      state.users = state.users.filter(u => u.nickname !== payload.nickname);
      state.chatEntries = [
        ...state.chatEntries,
        "Spieler ist abgehauen: " + payload.nickname
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
        state.users = state.users.map(user => {
          if (payload.rightGuessByNickname === user.nickname) {
            return {
              ...user,
              correctGuesses: user.correctGuesses + 1
            };
          }

          return user;
        });
      }

      // Unset the current sketcher.
      state.users = state.users.map(u =>
        u.isSketcher ? { ...u, isSketcher: false } : u
      );
      state.guessWord = null;
      state.sketchPaths = [];
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

    [Action.Disconnect]() {
      // Nothing to do here. The websocket backend plugin will do the whole job.
      return;
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
