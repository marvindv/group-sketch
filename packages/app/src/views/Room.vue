<template>
  <div class="container-fluid room">
    <div v-if="connectFailureError" class="alert alert-danger">
      <div v-if="connectFailureError === MessageError.NicknameInUse">
        <strong>Fehler!</strong> Nickname vergeben
      </div>
      <div v-else>Fehler {{ connectFailureError }}</div>
    </div>
    <div v-if="connectionLost" class="alert alert-danger">
      <strong>Verbindung abgebrochen!</strong>&nbsp;
      <a href="javascript:window.location.reload();">Seite neu laden</a>
    </div>

    <div v-if="!connectFailureError">
      <div class="dashboard row">
        <div class="col">
          <h4>
            <small class="text-muted">Spieler</small>
          </h4>
          <UserList
            v-if="users.length > 0"
            :users="users"
            :can-select="isSketcher"
            @user-selected="onUserSelected"
          />
          <div v-if="isSketcher" class="text-info mt-3 text-center">
            Klicke auf den TeilnehmerInn, der/die den Begriff erraten hat.
            <small class="d-block my-2 text-muted">oder</small>

            <button
              type="button"
              class="btn btn-danger d-block m-auto"
              @click="onGiveUp"
            >
              Aufgeben
            </button>
          </div>
        </div>

        <div class="col text-center sketchpad-col">
          <h4 class="text-center">
            <small class="text-muted">Magic happens here</small>
          </h4>

          <SketchPad
            ref="sketchPad"
            :enabled="isSketcher"
            @next-path="onNextPath"
          />

          <div v-if="isSketcher" class="alert alert-info sketcher-alert">
            <strong class="d-block mb-1">Du bist!</strong>
            <small class="text-muted"
              >Das Wort, das du für die anderen zeichnen sollst, lautet:</small
            >
            <span class="d-block guess-word">{{ guessWord }}</span>
          </div>
        </div>

        <div class="col">
          <h4 class="text-right">
            <small class="text-muted">Info</small>
          </h4>

          <Chat :chatEntries="chatEntries" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Path, NextPathMessage, MessageError } from "@group-sketch/shared";
import Vue from "vue";
import { mapGetters, mapState } from "vuex";

import SketchPad from "@/components/SketchPad.vue";
import UserList from "@/components/UserList.vue";
import Chat from "@/components/Chat.vue";
import User from "../models/user";
import Action from "../store/actions";
import Mutation from "../store/mutations";

export default Vue.extend({
  components: {
    Chat,
    SketchPad,
    UserList
  },
  props: {
    id: { type: String }
  },
  data() {
    return {
      MessageError
    };
  },
  computed: {
    sketchPad: {
      cache: false,
      get(): SketchPad {
        return this.$refs.sketchPad as SketchPad;
      }
    },
    nickname: {
      get(): string {
        return this.$store.state.joinRoomForm.nickname;
      }
    },
    ...mapGetters(["isSketcher"]),
    ...mapState({
      isConnected: "isConnected",
      users: "users",
      connectFailureError: "connectFailureError",
      connectionLost: "connectionList",
      guessWord: "guessWord",
      chatEntries: "chatEntries",
      sketchPaths: "sketchPaths"
    })
  },
  beforeMount() {
    // Make sure we are already connected.
    if (!this.isConnected) {
      this.$store.commit(Mutation.UpdateJoinRoomForm, {
        roomId: this.id,
        nickname: null
      });
      this.$router.push({ name: "Home" });
    }
  },
  mounted() {
    this.$store.subscribe(mutation => {
      if (mutation.type === Mutation.NextPath) {
        const payload = mutation.payload as NextPathMessage;
        this.sketchPad?.drawPaths([payload.nextPath]);
      }

      if (mutation.type === Mutation.NextSketcher) {
        this.sketchPad?.clear();
      }
    });
  },
  destroyed() {
    this.$store.dispatch(Action.Disconnect);
  },
  methods: {
    onNextPath(path: Path) {
      this.$store.dispatch(Action.AddPath, { path });
    },

    onUserSelected(user: User) {
      this.$store.dispatch(Action.CompleteSketching, {
        rightGuessByNickname: user.nickname
      });
    },

    onGiveUp() {
      this.$store.dispatch(Action.CompleteSketching, {
        rightGuessByNickname: null
      });
    },

    onClearClick() {
      this.sketchPad.clear();
    }
  }
});
</script>

<style lang="scss" scoped>
.sketcher-alert {
  max-width: 500px;
  margin: auto;

  .guess-word {
    font-size: 1.5rem;
  }
}

.sketchpad-col {
  user-select: none;
}
</style>
