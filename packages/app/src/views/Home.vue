<template>
  <div class="container">
    <div class="content text-center">
      <h1 class="text-center mb-5" title="Group Sketch">👪✏️</h1>

      <div class="card text-center">
        <div class="card-header">
          <strong>Raum betreten</strong>
        </div>

        <div class="card-body">
          <div v-if="connectFailureError !== null" class="mb-4">
            <div
              v-if="connectFailureError === MessageError.RoomNotFound"
              class="alert alert-danger text-left"
            >
              <strong class="d-block">Raum nicht gefunden 😔</strong> Überprüfe
              den Namen oder erstelle einen neuen Raum.
            </div>

            <div v-else class="alert alert-danger text-left">
              <strong class="d-block">Es ist ein Fehler aufgetreten 😔</strong>
              Bitte versuche es spaeter noch einmal.

              <small class="d-block">
                Fehler {{ connectFailureError }}:
                {{ MessageError[connectFailureError] }}
              </small>
            </div>
          </div>

          <form>
            <div class="form-group floating-labels">
              <input
                id="room-id-input"
                type="text"
                class="form-control"
                required
                v-model="roomId"
                @keyup.enter="onLoginClick"
              />
              <label class="form-control-placeholder" for="room-id-input"
                >Name des Raums</label
              >
            </div>

            <div class="form-group floating-labels">
              <input
                id="nickname-input"
                type="text"
                class="form-control"
                required
                v-model="nickname"
                @keyup.enter="onLoginClick"
              />
              <label class="form-control-placeholder" for="nickname-input"
                >Dein Nickname</label
              >
            </div>
          </form>
        </div>

        <button
          type="button"
          class="btn btn-primary card-footer-btn"
          @click="onLoginClick"
        >
          Los gehts!
        </button>
      </div>

      <div class="text-muted my-3">oder</div>

      <button type="button" class="btn btn-secondary btn-block create-room-btn">
        Raum erstellen
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import Mutation from "../store/mutations";
import Action from "../store/actions";
import { mapState } from "vuex";
import { MessageError } from "@group-sketch/shared";

export default Vue.extend({
  computed: {
    roomId: {
      get() {
        return this.$store.state.joinRoomForm.roomId;
      },
      set(value: string) {
        this.$store.commit(Mutation.UpdateJoinRoomForm, {
          roomId: value,
          nickname: this.$store.state.joinRoomForm.nickname
        });
      }
    },
    nickname: {
      get() {
        return this.$store.state.joinRoomForm.nickname;
      },
      set(value: string) {
        this.$store.commit(Mutation.UpdateJoinRoomForm, {
          roomId: this.$store.state.joinRoomForm.roomId,
          nickname: value
        });
      }
    },
    ...mapState(["connectFailureError"])
  },

  data() {
    return {
      MessageError
    };
  },

  methods: {
    onLoginClick(event: Event) {
      event.preventDefault();

      const unsubscribe = this.$store.subscribe(mutation => {
        if (mutation.type === Mutation.ConnectFailed) {
          unsubscribe();
        } else if (mutation.type === Mutation.RoomEntered) {
          unsubscribe();
          this.$router.push({
            name: "Room",
            params: { id: this.roomId as string }
          });
        }
      });

      this.$store.dispatch(Action.Connect, {
        nickname: this.nickname,
        roomId: this.roomId
      });
    }
  }
});
</script>

<style lang="scss" scoped>
@import "src/styles/helper/shadow";

.content {
  max-width: 500px !important;
  margin: auto;
}

.card {
  @include card(3);
}

.create-room-btn {
  max-width: 240px;
  margin: auto;
  @include card(1);
}

.form-group:last-child {
  margin-bottom: 0;
}
</style>
