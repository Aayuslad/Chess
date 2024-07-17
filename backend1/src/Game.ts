import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
	public whitePlayer: WebSocket;
	public blackPlayer: WebSocket;
	public whitePlayerName: string;
	public blackPlayerName: string;
	private bord: Chess;
	private startTmime: Date;

	constructor(player1: WebSocket, blackPlayerName: string, player2: WebSocket, whitePlayerName: string) {
		this.blackPlayer = player1;
		this.whitePlayer = player2;
		this.blackPlayerName = blackPlayerName;
		this.whitePlayerName = whitePlayerName;
		this.bord = new Chess();
		this.startTmime = new Date();
		this.blackPlayer.send(
			JSON.stringify({
				type: INIT_GAME,
				payload: {
					color: "black",
					opponentName: this.whitePlayerName,
					playerName: this.blackPlayerName,
					turn: this.bord.turn(),
				},
			}),
		);
		this.whitePlayer.send(
			JSON.stringify({
				type: INIT_GAME,
				payload: {
					color: "white",
					opponentName: this.blackPlayerName,
					playerName: this.whitePlayerName,
					turn: this.bord.turn(),
				},
			}),
		);
	}

	public makeMove(player: WebSocket, move: { from: string; to: string }) {
		const turn = this.bord.turn();

		switch (turn) {
			case "w":
				if (player !== this.whitePlayer) {
					console.log("Error: player is not white player");
					return;
				}
				break;
			case "b":
				if (player !== this.blackPlayer) {
					console.log("Error: player is not black player");
					return;
				}
				break;
			default:
				console.log("Error: player is not white or black player");
				return;
		}

		try {
			this.bord.move({ from: move.from, to: move.to });
			console.log(
				(turn === "w" ? "White player moves " : "Black player moves ") + move.from + " to " + move.to,
			);
		} catch (error) {
			console.log("Error in makeMove:" + move.from + " to " + move.to);
			return;
		}

		if (this.bord.isGameOver()) {
			const winner = turn === "w" ? this.whitePlayer : this.blackPlayer;

			this.blackPlayer.emit(GAME_OVER, { winner });
			this.whitePlayer.emit(GAME_OVER, { winner });

			return;
		}

		this.blackPlayer.send(JSON.stringify({ type: MOVE, payload: { move, turn: this.bord.turn() } }));
		this.whitePlayer.send(JSON.stringify({ type: MOVE, payload: { move, turn: this.bord.turn() } }));
	}
}

//        +------------------------+
//      8 | r  n  b  q  k  b  n  r |
//      7 | p  p  p  p  p  p  p  p |
//      6 | .  .  .  .  .  .  .  . |
//      5 | .  .  .  .  .  .  .  . |
//      4 | .  .  .  .  .  .  .  . |
//      3 | .  .  .  .  .  .  .  . |
//      2 | P  P  P  P  P  P  P  P |
//      1 | R  N  B  Q  K  B  N  R |
//        +------------------------+
//          a  b  c  d  e  f  g  h'
