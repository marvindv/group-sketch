<template>
  <div class="container-fluid room">
    <ul class="nav nav-pills nav-justified d-flex d-md-none">
      <li class="nav-item">
        <a
          :class="['nav-link', selectedCol === 'leaderboard' ? 'active' : '']"
          href="javascript:void(0)"
          @click="selectedCol = 'leaderboard'"
        >
          🏆
        </a>
      </li>
      <li class="nav-item">
        <a
          :class="['nav-link', selectedCol === 'sketchpad' ? 'active' : '']"
          href="javascript:void(0)"
          @click="selectedCol = 'sketchpad'"
        >
          ✏️
        </a>
      </li>
      <li class="nav-item">
        <a
          :class="['nav-link', selectedCol === 'log' ? 'active' : '']"
          href="javascript:void(0)"
          @click="selectedCol = 'log'"
        >
          ℹ️
        </a>
      </li>
    </ul>

    <div class="d-none d-md-block mb-4"></div>

    <div
      :class="{
        'dashboard row': true,
        'sketchpad-selected': selectedCol === 'sketchpad',
        'leaderboard-selected': selectedCol === 'leaderboard',
        'log-selected': selectedCol === 'log'
      }"
    >
      <div class="order-md-2 col-md text-center sketchpad-col mb-3">
        <div class="sketchpad-wrapper">
          <div v-if="!currentSketcher" class="alert alert-info">
            Warte auf mehr Spieler &hellip;
          </div>

          <div v-if="currentSketcher && !isSketcher" class="alert alert-info">
            {{ currentSketcher.nickname }} zeichnet &hellip;
          </div>

          <div v-if="isSketcher" class="alert alert-success">
            <div class="d-flex justify-content-between align-items-center">
              <button
                type="button"
                class="btn btn-light btn-sm"
                @click="onUndoPathClick"
              >
                ↩️
              </button>
              <strong>Du bist!</strong>
              <button
                type="button"
                class="btn btn-light btn-sm"
                @click="onClearSketchingClick"
              >
                🗑
              </button>
            </div>
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

      <div
        :class="[
          'order-md-1 col-md col-sm mb-3 leaderboard-col',
          selectedCol === 'leaderboard' ? 'selected' : null
        ]"
      >
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

      <div
        :class="[
          'order-md-3 col-md col-sm mb-3 log-col',
          selectedCol === 'log' ? 'selected' : null
        ]"
      >
        <div class="card info-card">
          <div class="card-header text-md-right">
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
import State from "../store/state";

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

      unsubscribeStore: null as (() => void) | null,
      selectedCol: "sketchpad" as "sketchpad" | "leaderboard" | "log"
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

    if (this.sketchPaths) {
      this.sketchPad?.drawPaths(this.sketchPaths);
    }

    this.unsubscribeStore = this.$store.subscribe((mutation, state: State) => {
      if (mutation.type === Mutation.NextPath) {
        const payload = mutation.payload as NextPathMessage;
        this.sketchPad?.drawPaths([payload.nextPath]);
      }

      if (mutation.type === Mutation.PathUndone) {
        this.sketchPad?.clear();
        this.sketchPad?.drawPaths(state.sketchPaths);
      }

      if (mutation.type === Mutation.SketchingCleared) {
        this.sketchPad?.clear();
      }

      if (
        mutation.type === Mutation.NextSketcher ||
        mutation.type === Mutation.SketchingCompleted
      ) {
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
        this.unsubscribeStore?.();
      }
    });
  },
  destroyed() {
    this.$store.dispatch(Action.Disconnect);
    this.unsubscribeStore?.();
  },
  methods: {
    onUndoPathClick() {
      this.$store.dispatch(Action.UndoPath);
    },

    onClearSketchingClick() {
      this.$store.dispatch(Action.ClearSketching);
    },

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

.nav {
  margin-bottom: 1rem;
  background: white;
  padding: 0.5rem;
  margin-left: -15px;
  margin-right: -15px;
  position: sticky;
  top: 0;
  z-index: 1;

  @include card(2);
}

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
  @include card(1);

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

// @include media-breakpoint-down(sm)
@media (max-width: 767.98px) {
  .room {
    position: relative;
    overflow-x: hidden;
    height: 100vh;
  }

  .dashboard {
    position: absolute;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    left: 0%;
    // $transition-base
    transition: left 0.2s ease-in-out;
  }

  .leaderboard-col {
    position: absolute;

    left: -100%;
  }

  .log-col {
    position: absolute;
    right: -100%;
  }

  .dashboard.leaderboard-selected {
    left: 100%;
  }

  .dashboard.log-selected {
    left: -100%;
  }
}
</style>
