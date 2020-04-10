<template>
  <div>
    <ul class="list-group">
      <template v-for="user in users">
        <li
          v-if="user.isSketcher"
          :key="user.nickname"
          class="list-group-item active"
        >
          {{ user.nickname }} ({{ user.correctGuesses }})
        </li>
        <li
          v-if="!user.isSketcher && !canSelect"
          :key="user.nickname"
          class="list-group-item"
        >
          {{ user.nickname }} ({{ user.correctGuesses }})
        </li>
        <button
          v-if="!user.isSketcher && canSelect"
          :key="user.nickname"
          type="button"
          class="list-group-item list-group-item-action"
          @click="onSelectUser(user)"
        >
          {{ user.nickname }} ({{ user.correctGuesses }})
        </button>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";

import User from "../models/user";

@Component
export default class UserList extends Vue {
  @Prop({ type: Array, required: true }) users!: User[];

  @Prop({ type: Boolean, required: true }) canSelect!: boolean;

  @Emit("user-selected")
  onSelectUser(user: User) {
    return user;
  }
}
</script>
