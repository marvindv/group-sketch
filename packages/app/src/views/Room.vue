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
import { Subject } from "rxjs";
import { distinctUntilChanged, pairwise, takeUntil } from "rxjs/operators";
import { Component, Vue, Ref, Prop } from "vue-property-decorator";
import { MessageType, Path, MessageError } from "@group-sketch/shared";

import SketchPad from "@/components/SketchPad.vue";
import UserList from "@/components/UserList.vue";
import Chat from "@/components/Chat.vue";
import BackendConnection from "../backend-connection";
import User from "../models/user";
import config from "../config";

@Component({
  components: { SketchPad, UserList, Chat },
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

  private dispose$ = new Subject();

  onNextPath(path: Path) {
    this.paths = [...this.paths, path];
    if (this.backend) {
      this.backend.send({ type: MessageType.NextPath, nextPath: path });
    }
  }

  onUserSelected(user: User) {
    this.backend?.send({
      type: MessageType.CompleteSketching,
      rightGuessByNickname: user.nickname,
    });
  }

  onGiveUp() {
    this.backend?.send({
      type: MessageType.CompleteSketching,
      rightGuessByNickname: null,
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
      .pipe(distinctUntilChanged(), pairwise(), takeUntil(this.dispose$))
      .subscribe(([connA, connB]) => {
        if (connA && !connB) {
          this.connectionLost = true;
        }
      });
    this.backend.users$.pipe(takeUntil(this.dispose$)).subscribe((users) => {
      this.users = users;
    });
    this.backend.isSketcher$
      .pipe(takeUntil(this.dispose$))
      .subscribe((isSketcher) => {
        this.isSketcher = isSketcher;
      });
    this.backend.guessWord$
      .pipe(takeUntil(this.dispose$))
      .subscribe((guessWord) => (this.guessWord = guessWord));
    this.backend.message$
      .pipe(takeUntil(this.dispose$))
      .subscribe((message) => {
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
              "Neuer Kumpel: " + message.nickname,
            ];
            break;
          case MessageType.UserLeft:
            this.chatEntries = [
              ...this.chatEntries,
              "Kumpel ist abgehauen: " + message.nickname,
            ];
            break;
          case MessageType.CompleteSketching:
            if (message.rightGuessByNickname === null) {
              this.chatEntries = [
                ...this.chatEntries,
                `Keiner hat "${message.guessWord}" erraten.`,
              ];
            } else {
              this.chatEntries = [
                ...this.chatEntries,
                '"' +
                  message.guessWord +
                  '" richtig geraten von: ' +
                  message.rightGuessByNickname,
              ];
            }
            break;
        }
      });
    this.backend.sketcherChanged$
      .pipe(takeUntil(this.dispose$))
      .subscribe(() => {
        this.sketchPad?.clear();
      });

    this.backend
      .connect(this.nickname, this.id)
      .then(() => console.log("Connected!"))
      .catch((err) => {
        console.error("Failed to connect", err);
        this.error = err;
      });
  }

  destroyed() {
    if (this.backend) {
      this.backend.close();
    }

    this.dispose$.next();
    this.dispose$.complete();
  }
}
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
