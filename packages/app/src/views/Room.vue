<template>
  <div class="container-fluid room">
    <div v-if="connectionLost" class="alert alert-danger">
      <strong>Verbindung abgebrochen!</strong>&nbsp;
      <a href="javascript:window.location.reload();">Seite neu laden</a>
    </div>

    <div class="dashboard row">
      <div class="order-md-2 col-md text-center sketchpad-col mb-3">
        <div class="sketchpad-wrapper">
          <div v-if="!currentSketcher" class="alert alert-info">
            Warte auf mehr Spieler &hellip;
          </div>

          <div v-if="currentSketcher && !isSketcher" class="alert alert-info">
            {{ currentSketcher.nickname }} zeichnet &hellip;
          </div>

          <div v-if="isSketcher" class="alert alert-success">
            <strong>Du bist!</strong>
          </div>

          <SketchPad
            ref="sketchPad"
            :enabled="isSketcher"
            @next-path="onNextPath"
          />

          <div v-if="isSketcher" class="alert alert-success sketcher-alert">
            <small class="text-muted">
              Das Wort, das du zeichnen sollst, ist:
            </small>
            <span class="d-block guess-word">{{ guessWord }}</span>

            <div class="toolbar">
              <b-modal
                id="submit-right-guess-modal"
                title="Wer hat's erraten?"
                hide-footer
                size="sm"
                scrollable
                centered
              >
                <template v-for="user in users">
                  <button
                    v-if="!user.thatsYou"
                    :key="user.nickname"
                    type="button"
                    class="btn btn-block btn-outline-primary"
                    @click="onUserSelected(user)"
                  >
                    {{ user.nickname }}
                  </button>
                </template>
              </b-modal>

              <button
                type="button"
                class="btn btn-link btn-sm font-weight-bold"
                v-b-modal.submit-right-guess-modal
              >
                Richtig geraten
              </button>

              <button
                type="button"
                class="btn btn-link btn-sm font-weight-bold text-danger"
                @click="onGiveUp"
              >
                Aufgeben
              </button>
            </div>
          </div>

          <div v-if="!isSketcher" class="alert alert-info">
            Was soll das nur sein? 🤔
          </div>
        </div>
      </div>

      <div class="order-md-1 col-md col-sm mb-3">
        <div class="card users-card">
          <div class="card-header">
            <strong>Spieler</strong>
          </div>

          <ul class="list-group list-group-flush leaderboard">
            <li class="list-group-item header">
              <small class="nickname-header text-muted">Nickname</small>
              <small class="guesses-header text-muted">Punkte</small>
            </li>
            <li
              v-for="user in users"
              :key="user.nickname"
              class="list-group-item"
            >
              <div class="nickname">
                {{ user.nickname }}
              </div>

              <div class="guesses">
                {{ user.correctGuesses }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="order-md-3 col-md col-sm mb-3">
        <div class="card info-card">
          <div class="card-header text-sm-right">
            <strong>Info</strong>
          </div>

          <div class="card-body">
            <Chat :chatEntries="chatEntries" />
          </div>
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
import Chat from "@/components/Chat.vue";
import User from "../models/user";
import Action from "../store/actions";
import Mutation from "../store/mutations";

export default Vue.extend({
  components: {
    Chat,
    SketchPad
  },
  props: {
    id: { type: String }
  },
  data() {
    return {
      // Make `MessageError` available in the template.
      MessageError,

      unsubscribeStore: null as (() => void) | null
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
    ...mapGetters({
      isSketcher: "isSketcher",
      currentSketcher: "currentSketcher",
      users: "sortedUsers"
    }),
    ...mapState({
      isConnected: "isConnected",
      connectFailureError: "connectFailureError",
      connectionLost: "connectionLost",
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
    window.scrollTo(0, 0);

    this.unsubscribeStore = this.$store.subscribe(mutation => {
      if (mutation.type === Mutation.NextPath) {
        const payload = mutation.payload as NextPathMessage;
        this.sketchPad?.drawPaths([payload.nextPath]);
      }

      if (mutation.type === Mutation.NextSketcher) {
        this.sketchPad?.clear();
      }

      if (
        mutation.type === Mutation.RoomLeft ||
        mutation.type === Mutation.ConnectionLost
      ) {
        this.$store.commit(Mutation.UpdateJoinRoomForm, {
          roomId: this.id,
          nickname: this.nickname
        });

        this.$router.push({ name: "Home" });
        this.unsubscribeStore();
      }
    });
  },
  destroyed() {
    this.$store.dispatch(Action.Disconnect);
    this.unsubscribeStore?.();
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
@import "src/styles/helper/shadow";

.leaderboard {
  .header {
    border-color: transparent;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .list-group-item {
    display: flex;
    justify-content: space-between;
  }
}

.sketcher-alert {
  line-height: 1;

  .guess-word {
    margin-top: 1rem;
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
  }
}

.sketchpad-col {
  user-select: none;
}

.sketchpad-wrapper {
  @include card(3);

  max-width: 400px;
  margin: auto;

  // $border-radius
  border-radius: 0.5rem;

  .alert:first-child {
    margin-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .alert:last-child {
    margin-bottom: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}

.info-card,
.users-card {
  @include card(1);

  height: 400px;
}
</style>
