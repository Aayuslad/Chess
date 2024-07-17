"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = GameManager_1.GameManager.getInstance();
wss.on("connection", function connection(ws) {
    console.log("User Joined");
    gameManager.addUser(ws);
    ws.on("error", console.error);
    ws.on("close", () => {
        gameManager.removeUser(ws);
    });
});
