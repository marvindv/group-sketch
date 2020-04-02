<template>
  <div class="container-fluid room">
    <div v-if="error" class="alert alert-danger">Fehler {{ error }}</div>
    <div v-if="connectionLost" class="alert alert-danger">
      <strong>Verbindung abgebrochen!</strong>&nbsp;
      <a href="javascript:window.location.reload();">Seite neu laden</a>
    </div>

    <div v-if="!error">
      <div class="dashboard row">
        <div class="col">
          <h4><small class="text-muted">Spieler</small></h4>
          <UserList
            v-if="users.length > 0"
            :users="users"
            :can-select="isSketcher"
            @user-selected="onUserSelected"
          />
          <div v-if="isSketcher" class="text-info mt-3">
            Wähle die Spieler, die den Begriff erraten haben hier.
          </div>
        </div>

        <div class="col text-center">
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

          <div class="chat">
            <div v-for="(entry, key) in chatEntries" :key="key" class="entry">
              {{ entry }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop } from "vue-property-decorator";
import { MessageType, Path, MessageError } from "@group-sketch/shared";

import SketchPad from "@/components/SketchPad.vue";
import UserList from "@/components/UserList.vue";
import BackendConnection from "../backend-connection";
import User from "../models/user";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import config from "../config";

@Component({
  components: { SketchPad, UserList }
})
export default class Room extends Vue {
  @Ref() readonly sketchPad: SketchPad | undefined;

  @Prop() readonly id!: string;

  @Prop() readonly nickname!: string;

  paths: Path[] = [];

  error: MessageError | null = null;

  users: User[] = [];

  chatEntries: string[] = [];

  isSketcher = false;

  guessWord: string | null = null;

  connectionLost = false;

  private backend: BackendConnection | undefined;

  onNextPath(path: Path) {
    this.paths = [...this.paths, path];
    if (this.backend) {
      this.backend.send({ type: MessageType.NextPath, nextPath: path });
    }
  }

  onUserSelected(user: User) {
    this.backend?.send({
      type: MessageType.CompleteSketching,
      rightGuessByNickname: user.nickname
    });
  }

  onClearClick() {
    this.sketchPad!.clear();
  }

  onRedrawClick() {
    this.sketchPad!.drawPaths(this.paths);
  }

  mounted() {
    this.backend = new BackendConnection(config.apiAddress());
    this.backend.connected$
      .pipe(distinctUntilChanged(), pairwise())
      .subscribe(([connA, connB]) => {
        if (connA && !connB) {
          this.connectionLost = true;
        }
      });
    this.backend.users$.subscribe(users => {
      this.users = users;
    });
    this.backend.isSketcher$.subscribe(isSketcher => {
      this.isSketcher = isSketcher;
    });
    this.backend.guessWord$.subscribe(
      guessWord => (this.guessWord = guessWord)
    );
    this.backend.message$.subscribe(message => {
      switch (message.type) {
        case MessageType.NextPath:
          if (this.sketchPad) {
            this.sketchPad.drawPaths([message.nextPath]);
          }

          break;

        case MessageType.RoomEntered:
          this.chatEntries = [...this.chatEntries, "Willkommen!"];
          break;
        case MessageType.NewUser:
          this.chatEntries = [
            ...this.chatEntries,
            "Neuer Kumpel: " + message.nickname
          ];
          break;
        case MessageType.UserLeft:
          this.chatEntries = [
            ...this.chatEntries,
            "Kumpel ist abgehauen: " + message.nickname
          ];
          break;
        case MessageType.CompleteSketching:
          this.chatEntries = [
            ...this.chatEntries,
            '"' +
              message.guessWord +
              '" richtig geraten von: ' +
              message.rightGuessByNickname
          ];
          break;
      }
    });
    this.backend.sketcherChanged$.subscribe(() => {
      this.sketchPad?.clear();
    });

    this.backend
      .connect(this.nickname, this.id)
      .then(() => console.log("Connected!"))
      .catch(err => {
        console.error("Failed to connect", err);
        this.error = err;
      });
  }

  destroyed() {
    if (this.backend) {
      this.backend.close();
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

.sketcher-alert {
  max-width: 500px;
  margin: auto;

  .guess-word {
    font-size: 1.5rem;
  }
}
</style>
