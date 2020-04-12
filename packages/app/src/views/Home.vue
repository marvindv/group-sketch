<template>
  <div class="container">
    <div class="content text-center">
      <h1 class="text-center mb-5" title="Group Sketch">👪✏️</h1>

      <div class="card text-center">
        <div class="card-header">
          <strong>Raum betreten</strong>
        </div>

        <div class="card-body">
          <div v-if="connectFailureError !== null">
            <template
              v-if="connectFailureError === MessageError.RoomNotFound"
            ></template>
            <template
              v-else-if="connectFailureError === MessageError.NicknameInUse"
            ></template>

            <div v-else class="alert alert-danger text-left mb-4">
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
                :class="[
                  'form-control',
                  connectFailureError === MessageError.RoomNotFound
                    ? 'is-invalid'
                    : ''
                ]"
                required
                v-model="roomId"
                :disabled="isConnecting"
                @keyup.enter="onLoginClick"
              />
              <label class="form-control-placeholder" for="room-id-input">
                Name des Raums
              </label>
              <div
                v-if="connectFailureError === MessageError.RoomNotFound"
                class="invalid-feedback"
              >
                Dieser Raum existiert nicht.
              </div>
            </div>

            <div class="form-group floating-labels">
              <input
                id="nickname-input"
                type="text"
                :class="[
                  'form-control',
                  connectFailureError === MessageError.NicknameInUse
                    ? 'is-invalid'
                    : ''
                ]"
                required
                v-model="nickname"
                :disabled="isConnecting"
                @keyup.enter="onLoginClick"
              />
              <label class="form-control-placeholder" for="nickname-input">
                Dein Nickname
              </label>
              <div
                v-if="connectFailureError === MessageError.NicknameInUse"
                class="invalid-feedback"
              >
                Der Nickname ist leider schon vergeben.
              </div>
            </div>
          </form>
        </div>

        <button
          type="button"
          class="btn btn-primary card-footer-btn"
          :disabled="isConnecting"
          @click="onLoginClick"
        >
          🚀 Los gehts!
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
import { mapState, mapGetters } from "vuex";
import { MessageError } from "@group-sketch/shared";

import Mutation from "../store/mutations";
import Action from "../store/actions";

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
    ...mapState(["connectFailureError"]),
    ...mapGetters(["isConnecting"])
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
  max-width: 400px !important;
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
</style>
