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
  border: 1px solid rgba(0, 0, 0, 0.125);
  height: 500px;
  overflow-y: scroll;

  padding: 0.5rem;

  .entry {
    padding: 0.5rem;
  }
}
</style>
