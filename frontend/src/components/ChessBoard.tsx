import { Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import pieces from "../assets/pieces";
import { MOVE } from "../pages/Game";

const preloadImages = (pieces: { [key: string]: string }) => {
	const imagePromises = Object.entries(pieces).map(([key, src]) => {
		return new Promise<{ key: string; img: HTMLImageElement }>((resolve) => {
			const img = new Image();
			img.src = src;
			img.onload = () => resolve({ key, img });
		});
	});
	return Promise.all(imagePromises).then((results) => {
		const images: { [key: string]: HTMLImageElement } = {};
		results.forEach(({ key, img }) => {
			images[key] = img;
		});
		return images;
	});
};

export function ChessBoard({
	board,
	socket,
}: {
	board?: ({
		square: Square;
		type: PieceSymbol;
		color: Color;
	} | null)[][];
	socket: WebSocket;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [draggedPiece, setDraggedPiece] = useState<{ row: number; col: number; piece: string } | null>(
		null,
	);
	const [from, setFrom] = useState<Square | null>(null);
	// const [to, setTo] = useState<Square | null>(null);
	const [images, setImages] = useState<{ [key: string]: HTMLImageElement } | null>(null);
	const [squareSize, setSquareSize] = useState(window.innerWidth <= 768 ? 40 : 60);

	useEffect(() => {
		preloadImages(pieces).then(setImages);
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setSquareSize(window.innerWidth <= 768 ? 40 : 60);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		if (!images) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = 8 * squareSize;
		canvas.height = 8 * squareSize;

		const drawBoard = () => {
			for (let row = 0; row < 8; row++) {
				for (let col = 0; col < 8; col++) {
					ctx.fillStyle = (row + col) % 2 === 0 ? "#f0d9b5" : "#b58863";
					ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
				}
			}
		};

		const drawPieces = () => {
			board?.forEach((row, rowIndex) => {
				row.forEach((piece, colIndex) => {
					if (
						piece &&
						!(draggedPiece && draggedPiece.row === rowIndex && draggedPiece.col === colIndex)
					) {
						const img = images[`${piece.color}${piece.type}` as keyof typeof pieces];
						if (img) {
							ctx.drawImage(
								img,
								colIndex * squareSize,
								rowIndex * squareSize,
								squareSize,
								squareSize,
							);
						}
					}
				});
			});
		};

		const draw = () => {
			drawBoard();
			drawPieces();
		};

		draw();

		const getSquareNotation = (row: number, col: number): Square => {
			const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
			const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
			return `${files[col]}${ranks[row]}` as Square;
		};

		const handleMouseDown = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const col = Math.floor(x / squareSize);
			const row = Math.floor(y / squareSize);

			if (board && board[row][col]) {
				setDraggedPiece({ row, col, piece: board[row][col]?.type as string });
				setFrom(getSquareNotation(row, col));
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (draggedPiece) {
				requestAnimationFrame(() => {
					draw();
					const rect = canvas.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const y = e.clientY - rect.top;

					if (board && board[draggedPiece.row][draggedPiece.col]) {
						const piece = board[draggedPiece.row][draggedPiece.col];
						if (piece) {
							const img = images[`${piece.color}${piece.type}` as keyof typeof pieces];
							if (img) {
								ctx.drawImage(
									img,
									x - squareSize / 2,
									y - squareSize / 2,
									squareSize,
									squareSize,
								);
							}
						}
					}
				});
			}
		};

		const handleMouseUp = (e: MouseEvent) => {
			if (draggedPiece) {
				const rect = canvas.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				const col = Math.floor(x / squareSize);
				const row = Math.floor(y / squareSize);

				// setTo(getSquareNotation(row, col));
				setDraggedPiece(null);
				draw();

				socket.send(
					JSON.stringify({ type: MOVE, move: { from: from, to: getSquareNotation(row, col) } }),
				);
			}
		};

		canvas.addEventListener("mousedown", handleMouseDown);
		canvas.addEventListener("mousemove", handleMouseMove);
		canvas.addEventListener("mouseup", handleMouseUp);

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			canvas.removeEventListener("mousemove", handleMouseMove);
			canvas.removeEventListener("mouseup", handleMouseUp);
		};
	}, [board, draggedPiece, from, socket, images, squareSize]);

	return <canvas ref={canvasRef}></canvas>;
}
