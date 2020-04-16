import {
  Message,
  Path,
  MessageType,
  NextSketcherMessage,
  CompleteSketchingMessage
} from "@group-sketch/shared";

import Client from "./client";
import GUESS_WORDS from "./guess-words";

export default class Room {
  private static rooms: { [id: string]: Room } = {
    default: new Room()
  };

  static getById(id: string): Room | undefined {
    return this.rooms[id];
  }

  private clients: Client[] = [];
  private currentSketcher: Client | undefined;
  private recentSketcher: Client[] = [];
  private currentGuessWord: string | undefined;
  private currentSketching: Path[] | undefined;
  private availableGuessWords: string[] = [...GUESS_WORDS];

  /**
   * Adds a new client to this room. Emits `MessageType.RoomEntered` to this client and
   * `MessageType.NewUser` to all other clients.
   * @param newClient
   */
  addClient(newClient: Client) {
    newClient.send({
      type: MessageType.RoomEntered,
      nicknames: this.getNicknames(),
      currentSketcher: this.currentSketcher?.getNickname(),
      currentSketching: this.currentSketching
    });

    this.broadcast({
      type: MessageType.NewUser,
      nickname: newClient.getNickname()!
    });

    this.clients.push(newClient);

    if (!this.currentSketcher) {
      this.selectNextSketcher();
    }
  }

  removeClient(client: Client) {
    const index = this.clients.indexOf(client);
    if (index > -1) {
      const client = this.clients[index];
      this.clients.splice(index, 1);
      this.broadcast({
        type: MessageType.UserLeft,
        nickname: client.getNickname()!
      });

      if (this.currentSketcher === client) {
        this.currentSketcher = undefined;
        this.selectNextSketcher();
      }
    }
  }

  hasClient(nickname: string): boolean {
    return this.clients.some(c => c.getNickname() === nickname);
  }

  getNicknames(): string[] {
    return this.clients.map(c => c.getNickname()!);
  }

  broadcastPath(source: Client, path: Path) {
    this.currentSketching?.push(path);

    const message: Message = {
      type: MessageType.NextPath,
      nextPath: path
    };

    for (const client of this.clients) {
      if (client !== source) {
        client.send(message);
      }
    }
  }

  undoPath() {
    this.currentSketching = this.currentSketching?.slice(
      0,
      this.currentSketching.length - 1
    );
    this.broadcast({ type: MessageType.UndoPath });
  }

  clearSketching() {
    this.currentSketching = [];
    this.broadcast({ type: MessageType.ClearSketching });
  }

  broadcast(message: Message) {
    for (const client of this.clients) {
      client.send(message);
    }
  }

  completeSketching(message: CompleteSketchingMessage) {
    const broadcastMessage = {
      ...message,
      guessWord: this.currentGuessWord
    };
    this.currentGuessWord = undefined;
    this.currentSketching = undefined;
    this.currentSketcher?.setSketcher(false);
    this.currentSketcher = undefined;
    this.broadcast(broadcastMessage);
    this.selectNextSketcher();
  }

  private selectNextSketcher() {
    if (this.clients.length < 2) {
      return;
    }

    let nextIndex = this.clients.findIndex(
      c => this.recentSketcher.indexOf(c) === -1
    );
    if (nextIndex === -1) {
      // All current clients sketched already. Start at the front again.
      this.recentSketcher = [];
      nextIndex = 0;
    }

    this.currentSketcher?.setSketcher(false);
    this.currentSketcher = undefined;

    const next = this.clients[nextIndex];
    this.recentSketcher.push(next);
    next.setSketcher(true);
    this.currentSketcher = next;
    this.currentSketching = [];

    const message: NextSketcherMessage = {
      type: MessageType.NextSketcher,
      nickname: next.getNickname()!
    };
    for (const client of this.clients) {
      if (client === next) {
        const sketcherMessage: NextSketcherMessage = {
          ...message,
          guessWord: this.setNextGuessWork()
        };
        client.send(sketcherMessage);
      } else {
        client.send(message);
      }
    }
  }

  /**
   * Sets the next guess work and returns the randomly selected word.
   */
  private setNextGuessWork(): string {
    if (this.availableGuessWords.length === 0) {
      this.availableGuessWords = [...GUESS_WORDS];
    }

    const nextIndex = this.getRandomInt(0, this.availableGuessWords.length);
    this.currentGuessWord = this.availableGuessWords[nextIndex];
    this.availableGuessWords.splice(nextIndex, 1);
    return this.currentGuessWord;
  }

  /**
   * The maximum is exclusive and the minimum is inclusive.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   * @param min
   * @param max
   */
  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
