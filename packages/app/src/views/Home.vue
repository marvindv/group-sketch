<template>
  <div class="home">
    <SketchPad ref="sketchPad" @next-path="onNextPath" />

    <button type="button" @click="onClearClick">Clear</button>
    <button type="button" @click="onRedrawClick">Redraw</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from "vue-property-decorator";
import { BehaviorSubject, Subject } from "rxjs";

import SketchPad from "@/components/SketchPad.vue";
import {
  extractMessage,
  MessageType,
  prepareMessage,
  Path,
  Message
} from "@group-sketch/shared";

class BackendConnection {
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private ws: WebSocket | undefined;
  private messageSubject = new Subject<Message>();

  get connected$() {
    return this.connectedSubject.asObservable();
  }

  get message$() {
    return this.messageSubject.asObservable();
  }

  constructor(private address: string) {}

  connect() {
    if (this.ws) {
      // TODO
    }

    this.ws = new WebSocket(this.address);
    this.ws.addEventListener("open", () => {
      console.log("open");
      this.connectedSubject.next(true);
    });
    this.ws.addEventListener("close", event => {
      console.warn("Connection closed:", event.reason);
      this.connectedSubject.next(false);
    });
    this.ws.addEventListener("error", err => {
      console.error("Socket error:", err);
      this.ws.close();
    });
    this.ws.addEventListener("message", event => {
      const message = extractMessage(event.data);
      this.messageSubject.next(message);
    });
  }

  send(message: Message) {
    this.ws.send(prepareMessage(message));
  }
}

@Component({
  components: { SketchPad }
})
export default class Home extends Vue {
  @Ref() readonly sketchPad: SketchPad | undefined;

  paths: Path[] = [];

  private backend: BackendConnection | undefined;

  onNextPath(path: Path) {
    this.paths = [...this.paths, path];
    if (this.backend) {
      this.backend.send({ type: MessageType.NextPath, nextPath: path });
    }
  }

  onClearClick() {
    this.sketchPad!.clear();
  }

  onRedrawClick() {
    this.sketchPad!.drawPaths(this.paths);
  }

  mounted() {
    this.backend = new BackendConnection("ws://localhost:8081/path");
    this.backend.message$.subscribe(message => {
      switch (message.type) {
        case MessageType.NextPath:
          if (this.sketchPad) {
            this.sketchPad.drawPaths([message.nextPath]);
          }

          break;

        default:
          console.error("Invalid message type", message.type);
      }
    });

    this.backend.connect();
  }
}
</script>
