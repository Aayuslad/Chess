import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

const wss = new WebSocketServer({ port: 80 });
const gameManager = GameManager.getInstance();

wss.on("connection", function connection(ws) {
	console.log("User Joined");

	gameManager.addUser(ws);

	ws.on("error", console.error);

	ws.on("close", () => {
		gameManager.removeUser(ws);
	});
});
