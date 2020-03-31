import * as WebSocket from "ws";
import { extractMessage, MessageType } from "@group-sketch/shared";

const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", function connection(ws) {
  ws.on("message", data => {
    console.log("received: %s", data);

    const message = extractMessage(data.toString());
    switch (message.type) {
      case MessageType.NextPath:
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });

        break;
    }
  });
});
