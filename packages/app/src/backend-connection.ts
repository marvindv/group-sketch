import { BehaviorSubject, Subject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  extractMessage,
  MessageType,
  prepareMessage,
  Message,
  MessageError,
  NextSketcherMessage
} from "@group-sketch/shared";

import User from "./models/user";

export default class BackendConnection {
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private ws: WebSocket | undefined;
  private messageSubject = new Subject<Message>();
  private usersSubject = new BehaviorSubject<User[]>([]);
  private guessWordSubject = new BehaviorSubject<string | null>(null);
  private sketcherChangedSubject = new Subject<NextSketcherMessage>();

  get connected$() {
    return this.connectedSubject.asObservable();
  }

  get message$() {
    return this.messageSubject.asObservable();
  }

  get users$() {
    return this.usersSubject.asObservable();
  }

  get thisUser$(): Observable<User | null> {
    return this.users$.pipe(
      map(users => {
        const index = users.findIndex(u => u.thatsYou);
        if (index === -1) {
          return null;
        }

        return users[index];
      })
    );
  }

  get guessWord$() {
    return this.guessWordSubject.asObservable();
  }

  get isSketcher$() {
    return this.thisUser$.pipe(map(user => (user ? user.isSketcher : false)));
  }

  get sketcherChanged$() {
    return this.sketcherChangedSubject.asObservable();
  }

  constructor(private address: string) {}

  connect(nickname: string, roomId: string): Promise<void> {
    nickname = nickname.trim();

    return new Promise<void>((resolve, reject) => {
      let resolved = false;

      this.ws = new WebSocket(this.address);
      this.ws.addEventListener("open", () => {
        this.send({ type: MessageType.EnterRoom, nickname, roomId });
        this.connectedSubject.next(true);
      });

      this.ws.addEventListener("close", event => {
        console.warn(
          "Connection closed:",
          event.code + ":",
          MessageError[event.code]
        );

        this.connectedSubject.next(false);
        this.usersSubject.next([]);

        if (!resolved) {
          resolved = true;
          reject(event.code);
        }
      });

      this.ws.addEventListener("error", err => {
        console.error("Socket error:", err, "Retry in 3 seconds.");
        this.ws!.close();
        this.ws = undefined;
        setTimeout(() => {
          this.connect(nickname, roomId);
        }, 3000);
      });

      this.ws.addEventListener("message", event => {
        const message = extractMessage(event.data);

        switch (message.type) {
          case MessageType.RoomEntered:
            this.usersSubject.next([
              { nickname, isSketcher: false, thatsYou: true },
              ...message.nicknames.map(n => ({
                isSketcher: n === message.currentSketcher,
                nickname: n,
                thatsYou: false
              }))
            ]);
            if (!resolved) {
              resolved = true;
              resolve();
            }
            break;

          case MessageType.NewUser: {
            const currentUsers = this.usersSubject.getValue();
            this.usersSubject.next([
              ...currentUsers,
              {
                isSketcher: false,
                nickname: message.nickname,
                thatsYou: false
              }
            ]);
            break;
          }

          case MessageType.UserLeft: {
            const currentUsers = this.usersSubject.getValue();
            this.usersSubject.next(
              currentUsers.filter(u => u.nickname !== message.nickname)
            );
            break;
          }

          case MessageType.NextSketcher: {
            const currentUsers = this.usersSubject.getValue();
            this.usersSubject.next(
              currentUsers.map(u => ({
                ...u,
                isSketcher: u.nickname === message.nickname
              }))
            );

            // This user got the guess word, which also means he/she is the sketcher.
            if (message.guessWord) {
              this.guessWordSubject.next(message.guessWord);
            } else {
              this.guessWordSubject.next(null);
            }

            this.sketcherChangedSubject.next(message);

            break;
          }
        }

        this.messageSubject.next(message);
      });
    });
  }

  send(message: Message) {
    if (this.ws) {
      this.ws.send(prepareMessage(message));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
