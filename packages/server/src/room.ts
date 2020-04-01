import { Message, Path, MessageType } from "@group-sketch/shared";

import Client from "./client";

export default class Room {
  private static rooms: { [id: string]: Room } = { default: new Room() };

  static getById(id: string): Room | undefined {
    return this.rooms[id];
  }

  private clients: Client[] = [];

  addClient(client: Client) {
    this.clients.push(client);
  }

  removeClient(client: Client) {
    const index = this.clients.indexOf(client);
    if (index > -1) {
      this.clients.splice(index, 1);
    }
  }

  broadcastPath(source: Client, path: Path) {
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
}
