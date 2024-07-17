import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {
	private static instance: GameManager;
	private games: Game[];
	private pendingUser: { player: WebSocket; playerName: string } | undefined;
	private users: WebSocket[];

	private constructor() {
		this.users = [];
		this.pendingUser = undefined;
		this.games = [];
	}

	public static getInstance(): GameManager {
		if (!GameManager.instance) {
			GameManager.instance = new GameManager();
		}
		return GameManager.instance;
	}

	public addUser(shocket: WebSocket) {
		this.users.push(shocket);
		this.addhandler(shocket);
	}

	public removeUser(shocket: WebSocket) {
		this.users = this.users.filter((user) => user !== shocket);
	}

	public addhandler(socket: WebSocket) {
		socket.on("message", (data) => {
			const message = JSON.parse(data.toString());

			console.log("Message received: ", message);

			if (message.type === INIT_GAME) {
				if (this.pendingUser) {
					const game = new Game(
						this.pendingUser.player,
						this.pendingUser.playerName,
						socket,
						message.playerName,
					);
					this.games.push(game);
					this.pendingUser = undefined;
					console.log("New game started : ", game);
				} else {
					this.pendingUser = { player: socket, playerName: message.playerName };
				}
			}

			if (message.type === MOVE) {
				const game = this.games.find(
					(game) => game.whitePlayer === socket || game.blackPlayer === socket,
				);
				if (game) {
					game.makeMove(socket, message.move);
				}
			}
		});
	}
}
