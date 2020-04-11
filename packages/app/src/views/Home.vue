<template>
  <div class="container">
    <div class="content text-center">
      <h1 class="text-center mb-5" title="Group Sketch">👪✏️</h1>

      <div class="card text-center">
        <div class="card-header">
          <strong>Raum betreten</strong>
        </div>

        <div class="card-body">
          <form>
            <div class="form-group">
              <input
                type="text"
                class="form-control"
                placeholder="Raum-ID"
                v-model="roomId"
                @keyup.enter="onLoginClick"
              />
            </div>

            <div class="form-group">
              <input
                type="text"
                class="form-control"
                placeholder="Dein Nickname"
                v-model="nickname"
                @keyup.enter="onLoginClick"
              />
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
    }
  },

  methods: {
    onLoginClick(event: Event) {
      event.preventDefault();
      this.$router.push({ name: "Room", params: { id: this.roomId } });
    }
  }
});
</script>

<style lang="scss" scoped>
@import "src/styles/shadow";

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
</style>
