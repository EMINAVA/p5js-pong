import express from "express";
import { WebSocketServer } from "ws";
import app from "./app.js";

const expressApp = express();

expressApp.use(express.static("public"));

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new WebSocketServer({ noServer: true });

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = expressApp.listen(443);
server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit("connection", socket, request);
    });
});

app(wsServer);
