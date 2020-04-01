import * as WebSocket from "ws";

import Client from "./client";

const port = 8081;
const wss = new WebSocket.Server({ port });
console.log("Wait for connections on port", port, "...");

wss.on("connection", function connection(ws) {
  console.log("New connection");
  new Client(ws);
});
