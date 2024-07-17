import { useEffect, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useWebShoket } from "../hooks/WebShoketHook";
import { Chess, Color, PieceSymbol, Square } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export function Game() {
	const socket = useWebShoket();
	const [chess, setChess] = useState<Chess>(new Chess());
	const [board, setBoard] = useState<
		({
			square: Square;
			type: PieceSymbol;
			color: Color;
		} | null)[][]
	>(chess.board());
	const [player1, setPlayer1] = useState("Player1");
	const [player2, setPlayer2] = useState("Player2");
	const [turn, setTurn] = useState("white");
	const [gameState, setGameState] = useState<
		"notStarted" | "waitingForOpponent" | "inProgress" | "finished"
	>("notStarted");

	useEffect(() => {
		if (socket) {
			socket.onmessage = (event) => {
				const message = JSON.parse(event.data);

				switch (message.type) {
					case INIT_GAME:
						setChess(new Chess());
						setGameState("inProgress");
						if (message.payload.color === "white") {
							console.log("You are white");
							setPlayer1(message.payload.playerName);
							setPlayer2(message.payload.opponentName);
						} else {
							console.log("You are black");
							setPlayer1(message.payload.opponentName);
							setPlayer2(message.payload.playerName);
						}
						setTurn(message.payload.turn);
						console.log("New Game Started");
						break;
					case MOVE:
						chess?.move(message.payload.move);
						chess?.board() && setBoard(chess?.board());
						setTurn(message.payload.turn);
						console.log("Move made", chess?.board());
						break;
					case GAME_OVER:
						console.log("Game Over");
						break;
				}
			};
		}
	}, [socket]);

	if (!socket) {
		return <div>Connectiong...</div>;
	}

	return (
		<div className="game-page bg-[#35155D] w-screen h-screen flex items-center justify-around relative">
			<div className="absolute top-0 left-0 text-white text-xl text-center py-2 px-2">
				Turn: {turn === "w" ? `${player1} (White)` : `${player2} (Balck)`}
			</div>

			{gameState === "inProgress" && (
				<div className="gameboard">
					<div className="text-white text-xl text-center py-2">{player2}</div>
					<ChessBoard socket={socket} board={board} />
					<div className="text-white text-xl text-center py-2">{player1}</div>
				</div>
			)}
			{(gameState === "waitingForOpponent" || gameState === "notStarted") && (
				<div className="playbutton">
					<form className="flex flex-col gap-6">
						<input
							type="text"
							placeholder="Enter your name"
							className="px-4 py-3 bg-[#b1ceff] text-black rounded-xl text-xl outline-none placeholder-gray-700"
							onChange={(event) => {
								if (event.target.value === "") {
									alert("please enter a name");
								}
								setPlayer1(event.target.value);
							}}
						/>

						<button
							type="button"
							onClick={() => {
								setGameState("waitingForOpponent");
								socket?.send(JSON.stringify({ type: INIT_GAME, playerName: player1 }));
							}}
							disabled={gameState === "waitingForOpponent"}
							className="bg-[#4477CE] py-3 px-10 text-xl rounded-2xl font-semibold text-white"
						>
							{gameState === "waitingForOpponent" ? "Waiting for opponent..." : "Play Game"}
						</button>
					</form>
				</div>
			)}
		</div>
	);
}
