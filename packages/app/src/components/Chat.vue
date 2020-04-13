<template>
  <div class="chat" ref="chat">
    <div v-for="(entry, key) in chatEntries" :key="key" class="entry">
      {{ entry }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop } from "vue-property-decorator";

@Component
export default class Chat extends Vue {
  @Ref() readonly chat: HTMLDivElement | undefined;

  @Prop({ type: Array, required: true }) chatEntries!: string[];

  updated() {
    if (this.chat) {
      this.chat.scrollTop = this.chat.clientHeight;
    }
  }
}
</script>

<style lang="scss" scoped>
.chat {
  height: 100%;
  overflow-y: scroll;

  .entry + .entry {
    margin-top: 0.5rem;
  }
}
</style>
